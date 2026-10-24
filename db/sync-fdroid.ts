// همگام‌سازی خودکار نرم‌استور با مخزن F-Droid
// نسخه‌های جدید به‌صورت «در انتظار بررسی» ثبت می‌شوند؛ انتشار فقط با تأیید مدیر
// اجرا: npx tsx --env-file=.env db/sync-fdroid.ts
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, inArray } from "drizzle-orm";
import * as s from "./schema";

const FDROID = "https://f-droid.org/repo";
const INDEX_PATH = new URL("../data/index-v2.json", import.meta.url).pathname;
const MAX_AGE_MS = 24 * 3600 * 1000;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");

const _dbUrl = process.env.DATABASE_URL!;
let _ssl: false | "require" | object;
if (process.env.DB_SSL === "disable") _ssl = false;
else if (process.env.DB_SSL_SERVERNAME) {
  _ssl = { servername: process.env.DB_SSL_SERVERNAME, rejectUnauthorized: true };
} else if (process.env.DB_SSL === "require" || !/localhost|127\.0\.0\.1/.test(_dbUrl)) {
  _ssl = "require";
} else _ssl = false;
const client = postgres(_dbUrl, { ssl: _ssl });
const db = drizzle(client, { schema: s });

function loc(obj: any): any {
  if (!obj || typeof obj !== "object") return undefined;
  return obj["en-US"] ?? obj["en"] ?? Object.values(obj)[0];
}
// متن رسمی فارسی از دیکشنری زبانی F-Droid — اولویت: fa، بعد fa-IR و گونه‌های دیگر fa.
// توجه: loc() دست نمی‌خورد چون ستون‌های EN (shortDesc/description) و changelog را تغذیه
// می‌کند؛ اگر loc() فارسی را ترجیح می‌داد، صفحه‌ی انگلیسی هم فارسی نشان می‌داد.
function locFa(obj: any): any {
  if (!obj || typeof obj !== "object") return undefined;
  if (obj["fa"]) return obj["fa"];
  const keys = Object.keys(obj);
  const ir = keys.find((k) => /^fa[-_]ir$/i.test(k));
  if (ir) return obj[ir];
  const anyFa = keys.find((k) => /^fa([-_]|$)/i.test(k));
  if (anyFa) return obj[anyFa];
  return undefined;
}
function cleanText(t: string, max = 4000): string {
  return t.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}

async function ensureIndex(): Promise<any> {
  let fresh = false;
  if (existsSync(INDEX_PATH)) {
    const { stat } = await import("node:fs/promises");
    const age = Date.now() - (await stat(INDEX_PATH)).mtimeMs;
    fresh = age < MAX_AGE_MS;
  }
  if (!fresh) {
    console.log("downloading fresh F-Droid index (~65MB)...");
    const r = await fetch("https://f-droid.org/repo/index-v2.json");
    if (!r.ok) throw new Error(`index download failed: ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(INDEX_PATH, buf);
    console.log(`index saved (${(buf.length / 1048576).toFixed(1)}MB)`);
  } else {
    console.log("using cached index");
  }
  return JSON.parse(readFileSync(INDEX_PATH, "utf8"));
}

// توسعه‌دهنده از authorName ایندکس: find-or-create با نام دقیق + کش درون‌اجرا
const devCache = new Map<string, string>();
async function resolveDeveloper(name: string, website: string | null): Promise<string | null> {
  const key = name.trim();
  if (!key) return null;
  if (devCache.has(key)) return devCache.get(key)!;
  const rows = await db.select({ id: s.developers.id, website: s.developers.website }).from(s.developers)
    .where(eq(s.developers.name, key)).limit(1);
  let id = rows[0]?.id;
  if (!id) {
    const ins = await db.insert(s.developers).values({ name: key, website: website ?? null })
      .returning({ id: s.developers.id });
    id = ins[0].id;
  } else if (website && !rows[0].website) {
    await db.update(s.developers).set({ website }).where(eq(s.developers.id, id));
  }
  devCache.set(key, id);
  return id;
}

async function main() {
  const idx = await ensureIndex();
  const pkgs = idx.packages as Record<string, any>;

  const repoRows = await db.select().from(s.repositories).where(eq(s.repositories.type, "fdroid")).limit(1);
  const repo = repoRows[0];
  const logRows = await db.insert(s.repositorySyncLogs).values({
    repositoryId: repo?.id ?? (await db.insert(s.repositories).values({
      name: "مخزن رسمی F-Droid", url: "https://f-droid.org/repo", type: "fdroid",
    }).returning())[0].id,
    status: "running",
  }).returning();
  const logId = logRows[0].id;

  const apps = await db.select().from(s.apps)
    .where(and(eq(s.apps.sourceType, "fdroid"), eq(s.apps.isPublished, true)));

  let added = 0, updated = 0, skipped = 0, logsFilled = 0, devsSet = 0;
  const notes: string[] = [];

  // بچ: همه‌ی نسخه‌های موجود را با یک کوئری می‌گیریم (رفع N+1) — شناسه و changelog هم برای بک‌فیل
  const appIds = apps.map((a) => a.id);
  const knownByApp = new Map<string, Map<number, { id: string; changelog: string | null }>>();
  if (appIds.length) {
    const BATCH = 500;
    for (let i = 0; i < appIds.length; i += BATCH) {
      const rows = await db
        .select({ appId: s.appVersions.appId, versionCode: s.appVersions.versionCode, id: s.appVersions.id, changelog: s.appVersions.changelog })
        .from(s.appVersions)
        .where(inArray(s.appVersions.appId, appIds.slice(i, i + BATCH)));
      for (const r of rows) {
        let map = knownByApp.get(r.appId);
        if (!map) { map = new Map(); knownByApp.set(r.appId, map); }
        map.set(r.versionCode, { id: r.id, changelog: r.changelog });
      }
    }
  }

  for (const app of apps) {
    const pkg = app.externalId || app.packageName;
    const p = pkgs[pkg];
    const md = p?.metadata;
    if (!p || !md) { skipped++; continue; }

    // نسخه‌های موجود در دیتابیس (از مپ بچ‌شده)
    const known = knownByApp.get(app.id) ?? new Map<number, { id: string; changelog: string | null }>();

    const allVers = (Object.values(p.versions || {}) as any[])
      .filter((v) => v?.manifest?.versionCode && v?.file?.name)
      .sort((a, b) => b.manifest.versionCode - a.manifest.versionCode);

    // بک‌فیل changelog نسخه‌های موجود: whatsNew ایندکس روی نسخه‌ی هم‌کد، فقط وقتی خالی است
    for (const v of allVers) {
      const rec = known.get(Number(v.manifest.versionCode));
      const wn = v.whatsNew ? cleanText(loc(v.whatsNew) || "") : "";
      if (rec && !rec.changelog && wn) {
        await db.update(s.appVersions).set({ changelog: wn }).where(eq(s.appVersions.id, rec.id));
        rec.changelog = wn;
        logsFilled++;
      }
    }

    for (const v of allVers.slice(0, 5)) {
      const vc = Number(v.manifest.versionCode);
      if (known.has(vc)) continue;
      const f = v.file, m = v.manifest;
      const wn = v.whatsNew ? cleanText(loc(v.whatsNew) || "") : "";
      // returning شناسه را مستقیم برمی‌گرداند (بدون کوئری مجدد)
      const [nv] = await db.insert(s.appVersions).values({
        appId: app.id,
        versionName: String(m.versionName), versionCode: vc,
        fileUrl: FDROID + f.name, fileSize: f.size ?? null,
        sha256: f.sha256 || null, minSdk: m.usesSdk?.minSdkVersion ?? null,
        fileType: "apk", status: "pending", isCurrent: false,
        changelog: wn || null,
        source: "F-Droid auto-sync", publishedAt: v.added ? new Date(v.added) : new Date(),
      }).returning({ id: s.appVersions.id });
      // مجوزها — درج گروهی
      const perms: string[] = (m.usesPermission || []).map((x: any) => x.name).filter(Boolean).slice(0, 60);
      if (perms.length) {
        await db.insert(s.appPermissions).values(
          perms.map((pm) => ({ versionId: nv.id, permission: pm }))
        );
      }
      added++;
      notes.push(`${app.nameFa}: v${m.versionName} (${vc})`);
      known.set(vc, { id: nv.id, changelog: wn || null });
    }

    // به‌روزرسانی متادیتا اگر تغییر کرده
    const summary = loc(md.summary) || "";
    const description = loc(md.description) || summary;
    const iconName = loc(md.icon)?.name;
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    // توسعه‌دهنده از authorName ایندکس — فقط وقتی اپ هنوز توسعه‌دهنده ندارد
    if (!app.developerId && md.authorName) {
      const devId = await resolveDeveloper(String(md.authorName), md.authorWebSite || null);
      if (devId) { patch.developerId = devId; devsSet++; }
    }
    const newShort = cleanText(summary, 300);
    if (newShort && newShort !== app.shortDesc) patch.shortDesc = newShort;
    const newDesc = cleanText(description);
    if (newDesc && newDesc !== app.description) patch.description = newDesc;
    // متن رسمی فارسی — فقط وقتی خالی است یا منشأ فعلی رسمی/ماشینی است؛ متن دستی
    // قدیمی (منشأ NULL با متن موجود) حفظ می‌شود، و رسمی بر ماشینی ارجح است
    const faSummary = locFa(md.summary);
    if (faSummary) {
      const t = cleanText(faSummary, 300);
      if (t && t !== app.shortDescFa && (app.shortDescFa == null || app.shortDescFaSource === "official" || app.shortDescFaSource === "machine")) {
        patch.shortDescFa = t; patch.shortDescFaSource = "official";
      }
    }
    const faDescription = locFa(md.description);
    if (faDescription) {
      const t = cleanText(faDescription);
      if (t && t !== app.descriptionFa && (app.descriptionFa == null || app.descriptionFaSource === "official" || app.descriptionFaSource === "machine")) {
        patch.descriptionFa = t; patch.descriptionFaSource = "official";
      }
    }
    if (iconName && FDROID + iconName !== app.iconUrl) patch.iconUrl = FDROID + iconName;
    if (Object.keys(patch).length > 1) {
      await db.update(s.apps).set(patch).where(eq(s.apps.id, app.id));
      updated++;
    }
  }

  const message = `نسخه‌های جدید: ${added} | اپ‌های به‌روزشده: ${updated} | ردشده: ${skipped} | changelog بک‌فیل: ${logsFilled} | توسعه‌دهنده ست‌شده: ${devsSet}\n` + notes.slice(0, 30).join("\n");
  await db.update(s.repositorySyncLogs).set({
    status: "success", finishedAt: new Date(), message: message.slice(0, 5000),
    appsAdded: added, appsUpdated: updated,
  }).where(eq(s.repositorySyncLogs.id, logId));
  if (repo) {
    await db.update(s.repositories).set({ lastSyncAt: new Date(), lastSyncStatus: "success" })
      .where(eq(s.repositories.id, repo.id));
  }

  console.log(`✓ sync done: +${added} versions, ~${updated} apps updated, ${skipped} skipped, ${logsFilled} changelogs backfilled, ${devsSet} developers set`);
  await client.end();
}

main().catch(async (e) => {
  console.error("sync failed:", e.message);
  try {
    await db.insert(s.repositorySyncLogs).values({
      repositoryId: (await db.select().from(s.repositories).where(eq(s.repositories.type, "fdroid")).limit(1))[0]?.id ?? "",
      status: "failed", finishedAt: new Date(), message: String(e.message).slice(0, 2000),
    });
  } catch { /* ignore */ }
  await client.end();
  process.exit(1);
});

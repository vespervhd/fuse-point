// غنی‌سازی متادیتای موجود از ایندکس F-Droid — توسعه‌دهنده + تغییرات نسخه‌ها
// استفاده:
//   DATABASE_URL=... node scripts/enrich-fdroid-metadata.mjs [--dry-run]
// چه می‌کند (فقط از داده‌ی خود منبع؛ هیچ نام/متنی ساخته نمی‌شود):
//   ۱) توسعه‌دهنده: برای اپ‌های F-Droid از metadata.authorName ایندکس؛
//      برای بقیه‌ی اپ‌هایی که github_repo دارند، از مالک همان ریپو (بخش اول مسیر).
//      فقط وقتی developer_id خالی است پر می‌شود؛ مقدار موجود هرگز بازنویسی نمی‌شود.
//   ۲) تغییرات نسخه‌ها: برای نسخه‌های اپ‌های F-Droid که changelog خالی دارند،
//      از whatsNew همان نسخه در ایندکس (تطبیق با versionCode).
// ایندکس از data/index-v2.json خوانده می‌شود (همان کش سینک)؛ اگر نبود دانلود می‌شود.
// idempotent: اجرای دوباره هیچ تغییری نمی‌دهد.

import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dir, "..");
const INDEX_PATH = path.join(ROOT, "data/index-v2.json");
const dryRun = process.argv.includes("--dry-run");

const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.DB_NO_SSL ? false : { rejectUnauthorized: false, servername: process.env.DB_SSL_SERVERNAME },
  connect_timeout: 30,
});

function loc(obj) {
  if (!obj || typeof obj !== "object") return undefined;
  return obj["en-US"] ?? obj["en"] ?? Object.values(obj)[0];
}
function cleanText(t, max = 4000) {
  return String(t).replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}

async function ensureIndex() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.log("دانلود ایندکس F-Droid (~65MB)...");
    const r = await fetch("https://f-droid.org/repo/index-v2.json");
    if (!r.ok) throw new Error(`index download failed: ${r.status}`);
    fs.writeFileSync(INDEX_PATH, Buffer.from(await r.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
}

// find-or-create توسعه‌دهنده با نام دقیق (الگوی select-اول خود پروژه)
const devCache = new Map();
async function developerId(name, website) {
  const key = name;
  if (devCache.has(key)) return devCache.get(key);
  const rows = await sql`SELECT id FROM developers WHERE name = ${name} LIMIT 1`;
  let id = rows[0]?.id;
  if (!id) {
    if (dryRun) { id = `dry:${name}`; }
    else {
      const ins = await sql`
        INSERT INTO developers (id, name, website)
        VALUES (${crypto.randomUUID()}, ${name}, ${website ?? null})
        RETURNING id`;
      id = ins[0].id;
      stats.devCreated++;
    }
  } else if (website && !dryRun) {
    await sql`UPDATE developers SET website = ${website} WHERE id = ${id} AND website IS NULL`;
  }
  devCache.set(key, id);
  return id;
}

const stats = {
  devCreated: 0,
  appsDevFdroid: 0,
  appsDevGithub: 0,
  appsNoSource: 0,
  versionsChangelog: 0,
  appsWithChangelog: 0,
};

async function main() {
  const idx = await ensureIndex();
  const pkgs = idx.packages || {};

  const before = await sql`
    SELECT
      (SELECT count(*) FROM developers) AS devs,
      (SELECT count(*) FROM apps WHERE developer_id IS NOT NULL) AS apps_with_dev,
      (SELECT count(*) FROM app_versions WHERE changelog IS NOT NULL AND changelog <> '') AS versions_with_log`;
  console.log("قبل:", before[0]);

  const apps = await sql`
    SELECT id, package_name, external_id, source_type, github_repo, developer_id
    FROM apps`;

  // ─── ۱) توسعه‌دهنده ───
  for (const app of apps) {
    if (app.developer_id) continue;
    let name = null, website = null, via = null;
    if (app.source_type === "fdroid") {
      const md = pkgs[app.external_id || app.package_name]?.metadata;
      const author = md?.authorName?.trim();
      if (author) { name = author; website = md.authorWebSite || null; via = "fdroid"; }
    }
    if (!name && app.github_repo) {
      // github_repo گاهی مسیر «owner/repo» و گاهی URL کامل است — هر دو به مالک می‌رسند
      const cleaned = app.github_repo.trim().replace(/^https?:\/\//i, "").replace(/^github\.com\//i, "");
      const owner = cleaned.split("/")[0]?.trim();
      if (owner && !owner.includes(":")) { name = owner; website = `https://github.com/${owner}`; via = "github"; }
    }
    if (!name) { stats.appsNoSource++; continue; }
    const id = await developerId(name, website);
    if (!dryRun) await sql`UPDATE apps SET developer_id = ${id} WHERE id = ${app.id} AND developer_id IS NULL`;
    if (via === "fdroid") stats.appsDevFdroid++; else stats.appsDevGithub++;
  }

  // ─── ۲) تغییرات نسخه‌ها (فقط اپ‌های F-Droid) ───
  const fdroidApps = apps.filter((a) => a.source_type === "fdroid");
  for (const app of fdroidApps) {
    const p = pkgs[app.external_id || app.package_name];
    if (!p?.versions) continue;
    const byCode = new Map();
    for (const v of Object.values(p.versions)) {
      const vc = Number(v?.manifest?.versionCode);
      const wn = v?.whatsNew ? cleanText(loc(v.whatsNew) || "") : "";
      if (vc && wn) byCode.set(vc, wn);
    }
    if (!byCode.size) continue;
    const versions = await sql`
      SELECT id, version_code FROM app_versions
      WHERE app_id = ${app.id} AND (changelog IS NULL OR changelog = '')`;
    let touched = false;
    for (const v of versions) {
      const text = byCode.get(Number(v.version_code));
      if (!text) continue;
      if (!dryRun) await sql`UPDATE app_versions SET changelog = ${text} WHERE id = ${v.id}`;
      stats.versionsChangelog++;
      touched = true;
    }
    if (touched) stats.appsWithChangelog++;
  }

  const after = await sql`
    SELECT
      (SELECT count(*) FROM developers) AS devs,
      (SELECT count(*) FROM apps WHERE developer_id IS NOT NULL) AS apps_with_dev,
      (SELECT count(*) FROM app_versions WHERE changelog IS NOT NULL AND changelog <> '') AS versions_with_log`;
  console.log(dryRun ? "DRY-RUN — آماری که با اجرای واقعی به دست می‌آید:" : "بعد:", after[0]);
  console.log("خلاصه:", stats);
  await sql.end();
}

main().catch(async (e) => {
  console.error("enrich failed:", e.message);
  try { await sql.end(); } catch { /* ignore */ }
  process.exit(1);
});

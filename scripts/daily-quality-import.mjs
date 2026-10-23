// ایمپورت روزانه‌ی اپ‌های باکیفیت — هر روز ~۱۰۰ اپ برای هر پلتفرم
// استفاده:
//   DATABASE_URL=... DB_SSL_SERVERNAME=... node scripts/daily-quality-import.mjs [--per-platform 100]
// اندروید: از ایندکس لوکال F-Droid (data/index-v2.json) با امتیاز کیفیت
// لینوکس/ویندوز: از صف کیوریت‌شده (data/import-queue-linux.json / data/import-queue-windows.json)

import postgres from "postgres";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dir, "..");

const args = process.argv.slice(2);
const perPlatform = parseInt((args.find((a) => a.startsWith("--per-platform=")) || "").split("=")[1] || "100", 10);
const only = (args.find((a) => a.startsWith("--only=")) || "").split("=")[1] || null; // android|linux|windows

const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.DB_NO_SSL ? false : { rejectUnauthorized: false, servername: process.env.DB_SSL_SERVERNAME },
  connect_timeout: 30,
});

const stats = { android: 0, linux: 0, windows: 0, skipped: 0 };

// نگاشت دسته‌های F-Droid به اسلاگ‌های خودمان (تقریبی)
const FDROID_CAT_MAP = {
  "Internet": "internet", "Multimedia": "multimedia", "Games": "games",
  "Graphics": "graphics", "Office": "office", "Security": "security",
  "System": "system", "Utilities": "utilities", "Development": "development",
  "Education": "education", "Health": "health", "Finance": "finance",
  "Navigation": "navigation", "Communication": "communication",
  "Reading": "reading", "Music": "music", "Video": "video",
};

function fdroidIconUrl(pkg, meta) {
  const icon = meta?.icon?.["en-US"]?.name;
  if (!icon) return null;
  return `https://f-droid.org/repo${icon}`;
}

function qualityScore(pkg, meta) {
  let s = 0;
  const now = Date.now();
  const upd = meta.lastUpdated || 0;
  const ageDays = (now - upd) / 86400000;
  if (ageDays < 365) s += 3;
  else if (ageDays < 730) s += 2;
  else if (ageDays < 1095) s += 1;
  else return -100; // قدیمی‌تر از ۳ سال: رد
  if (meta.icon) s += 2;
  if (meta.screenshots?.["en-US"]?.length) s += 2;
  if (meta.changelog) s += 1;
  if (meta.sourceCode) s += 1;
  if (meta.authorName) s += 1;
  const summary = meta.summary?.["en-US"] || "";
  const desc = meta.description?.["en-US"] || "";
  if (summary.length > 10) s += 1;
  if (desc.length > 100) s += 1;
  if (meta.antiFeatures && Object.keys(meta.antiFeatures).length) s -= 10;
  if (!summary || !desc) return -100;
  return s;
}

async function importAndroid(n) {
  console.log("اندروید: خواندن ایندکس F-Droid...");
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, "data/index-v2.json"), "utf8"));
  const pkgs = idx.packages;
  const existing = new Set((await sql`SELECT package_name FROM apps WHERE platform = 'android'`).map((r) => r.package_name));
  console.log(`  کل پکیج‌ها: ${Object.keys(pkgs).length}، موجود: ${existing.size}`);

  const cands = [];
  for (const [pkg, p] of Object.entries(pkgs)) {
    if (existing.has(pkg)) continue;
    const meta = p.metadata || {};
    const score = qualityScore(pkg, meta);
    if (score < 0) continue;
    cands.push({ pkg, meta, score });
  }
  cands.sort((a, b) => b.score - a.score);
  console.log(`  کاندیدای باکیفیت: ${cands.length}`);
  const picked = cands.slice(0, n);

  const cats = await sql`SELECT id, slug FROM categories`;
  const catId = {};
  cats.forEach((c) => (catId[c.slug] = c.id));

  let added = 0;
  for (const { pkg, meta } of picked) {
    try {
      const slug = pkg.replace(/\./g, "-").toLowerCase().slice(0, 80);
      const ex = await sql`SELECT id FROM apps WHERE slug = ${slug} OR package_name = ${pkg} LIMIT 1`;
      if (ex.length) { stats.skipped++; continue; }
      const appId = crypto.randomUUID();
      const nameEn = (meta.name?.["en-US"] || pkg).slice(0, 255);
      const summary = (meta.summary?.["en-US"] || "").slice(0, 500);
      const desc = (meta.description?.["en-US"] || "").slice(0, 4000);
      const iconUrl = fdroidIconUrl(pkg, meta);
      const sourceUrl = meta.sourceCode || `https://f-droid.org/packages/${pkg}/`;
      await sql`INSERT INTO apps (id, slug, package_name, name_en, name_fa,
        short_desc, description, icon_url, platform, is_published,
        source_type, source_url, external_id, is_open_source)
        VALUES (${appId}, ${slug}, ${pkg}, ${nameEn}, ${nameEn},
        ${summary}, ${desc}, ${iconUrl}, 'android', true,
        'fdroid', ${sourceUrl}, ${pkg}, true)`;
      // نسخه‌ی فعلی (ارجاع به صفحه‌ی F-Droid)
      await sql`INSERT INTO app_versions (id, app_id, version_name, version_code, file_url,
        file_type, status, is_current, published_at)
        VALUES (${crypto.randomUUID()}, ${appId}, '1.0', 1, ${`https://f-droid.org/packages/${pkg}/`},
        'external', 'active', true, NOW())`;
      // دسته‌بندی
      const fdroidCats = meta.categories || [];
      for (const fc of fdroidCats) {
        const ours = FDROID_CAT_MAP[fc];
        if (ours && catId[ours]) {
          await sql`INSERT INTO app_categories (app_id, category_id) VALUES (${appId}, ${catId[ours]}) ON CONFLICT DO NOTHING`;
          break;
        }
      }
      added++;
    } catch (e) {
      stats.skipped++;
    }
  }
  stats.android = added;
  console.log(`  اندروید: ${added} اضافه شد`);
}

async function importFromQueue(platform, n) {
  const qpath = path.join(ROOT, `data/import-queue-${platform}.json`);
  if (!fs.existsSync(qpath)) {
    console.log(`${platform}: صف وجود ندارد (${qpath}) — رد شد`);
    return;
  }
  const queue = JSON.parse(fs.readFileSync(qpath, "utf8"));
  console.log(`${platform}: ${queue.length} در صف`);
  const picked = queue.slice(0, n);
  const rest = queue.slice(n);

  const cats = await sql`SELECT id, slug FROM categories`;
  const catId = {};
  cats.forEach((c) => (catId[c.slug] = c.id));

  let added = 0;
  for (const t of picked) {
    try {
      const pkg = `${platform}:${t.slug}`;
      const ex = await sql`SELECT id FROM apps WHERE slug = ${t.slug} OR package_name = ${pkg} LIMIT 1`;
      if (ex.length) { stats.skipped++; continue; }
      const appId = crypto.randomUUID();
      await sql`INSERT INTO apps (id, slug, package_name, name_en, name_fa,
        short_desc_fa, description_fa, icon_url, platform, is_published,
        source_type, source_url, external_id, github_repo, is_open_source)
        VALUES (${appId}, ${t.slug}, ${pkg}, ${t.name_en}, ${t.name_fa || t.name_en},
        ${t.short_desc || null}, ${t.description || null}, ${t.icon_url || null}, ${platform}, true,
        'external', ${t.source_url || null}, ${pkg}, ${t.github_repo || null}, ${!!t.is_open_source})`;
      await sql`INSERT INTO app_versions (id, app_id, version_name, version_code, file_url,
        file_type, status, is_current, published_at)
        VALUES (${crypto.randomUUID()}, ${appId}, '1.0', 1, ${t.source_url || ""},
        'external', 'active', true, NOW())`;
      const cid = t.category_slug && catId[t.category_slug];
      if (cid) await sql`INSERT INTO app_categories (app_id, category_id) VALUES (${appId}, ${cid}) ON CONFLICT DO NOTHING`;
      added++;
    } catch (e) {
      stats.skipped++;
    }
  }
  // به‌روزرسانی صف
  const remaining = rest.filter((t) => !picked.slice(0, added).includes(t));
  fs.writeFileSync(qpath, JSON.stringify(rest, null, 1));
  stats[platform] = added;
  console.log(`  ${platform}: ${added} اضافه شد، ${rest.length} در صف ماند`);
}

async function main() {
  console.log(`شروع ایمپورت روزانه (هر پلتفرم: ${perPlatform})`);
  if (!only || only === "android") await importAndroid(perPlatform);
  if (!only || only === "linux") await importFromQueue("linux", perPlatform);
  if (!only || only === "windows") await importFromQueue("windows", perPlatform);
  const totals = await sql`SELECT platform, COUNT(*) AS c FROM apps WHERE is_published = true GROUP BY platform`;
  console.log("آمار:", JSON.stringify(stats));
  console.log("جمع کل:", JSON.stringify(totals));
  await sql.end();
}

main().catch((e) => { console.error("خطا:", e.message); process.exit(1); });

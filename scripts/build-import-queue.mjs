// ساخت صف ایمپورت روزانه از فایل‌های کیوریت‌شده (خروجی ایجنت‌ها)
// استفاده:
//   node scripts/build-import-queue.mjs --platform linux --in data/linux-batch3.json [--in ...] [--out data/import-queue-linux.json] [--dry-run]
//
// ورودی: فایل‌های JSON با شکل بچ‌های کیوریت‌شده:
//   [{ slug, name, name_fa, platform, source_url, github_repo, category_slug, short_desc_fa, icon_url }]
// خروجی: data/import-queue-<platform>.json با شکل موردنیاز daily-quality-import.mjs:
//   [{ slug, name_en, name_fa, short_desc, description, icon_url, source_url, github_repo, category_slug, is_open_source }]
//
// امن: اسلاگ‌های تکراری (داخل صف فعلی + همه‌ی بچ‌های قبلی data/*batch*.json که قبلاً ایمپورت شده‌اند) حذف می‌شوند.
// خود daily-quality-import.mjs هم موقع ایمپورت دوباره با دیتابیس چک می‌کند (safety net).

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dir, "..");

const args = process.argv.slice(2);
const get = (k, d = null) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split("=").slice(1).join("=") : d;
};
const has = (k) => args.includes(`--${k}`);

const platform = get("platform");
if (!platform || !["linux", "windows"].includes(platform)) {
  console.error("platform باید linux یا windows باشد: --platform=linux");
  process.exit(1);
}
const inputs = args.filter((a) => a.startsWith("--in=")).map((a) => a.slice(5));
if (!inputs.length) {
  console.error("حداقل یک ورودی لازم است: --in=data/xxx.json");
  process.exit(1);
}
const outArg = get("out", `data/import-queue-${platform}.json`);
const outPath = path.isAbsolute(outArg) ? outArg : path.join(ROOT, outArg);
const dryRun = has("dry-run");

// اسلاگ‌هایی که قبلاً ایمپورت شده‌اند (بچ‌های قبلی) — نباید دوباره وارد صف شوند
const imported = new Set();
for (const f of fs.readdirSync(path.join(ROOT, "data"))) {
  if (!/batch\d*[a-e]?\.json$/.test(f)) continue;
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(ROOT, "data", f), "utf8"));
    for (const t of arr) if (t.slug) imported.add(t.slug);
  } catch { /* نادیده */ }
}

// صف فعلی (اگر هست) — حفظ ترتیب، حذف تکراری‌ها
let queue = [];
if (fs.existsSync(outPath)) {
  try { queue = JSON.parse(fs.readFileSync(outPath, "utf8")); } catch { queue = []; }
}
const inQueue = new Set(queue.map((t) => t.slug));

let added = 0, skippedDup = 0, skippedImported = 0, skippedBad = 0;
for (const inp of inputs) {
  const p = path.isAbsolute(inp) ? inp : path.join(ROOT, inp);
  if (!fs.existsSync(p)) { console.error(`ورودی پیدا نشد: ${inp}`); continue; }
  const arr = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const t of arr) {
    if (!t.slug || !t.name) { skippedBad++; continue; }
    if (imported.has(t.slug)) { skippedImported++; continue; }
    if (inQueue.has(t.slug)) { skippedDup++; continue; }
    queue.push({
      slug: t.slug,
      name_en: t.name,
      name_fa: t.name_fa || t.name,
      short_desc: t.short_desc_fa || t.short_desc || null,
      description: t.description_fa || t.description || t.short_desc_fa || null,
      icon_url: t.icon_url || null,
      source_url: t.source_url || null,
      github_repo: t.github_repo || null,
      category_slug: t.category_slug || null,
      is_open_source: !!t.github_repo || !!t.is_open_source,
    });
    inQueue.add(t.slug);
    added++;
  }
}

console.log(`پلتفرم: ${platform}`);
console.log(`اضافه شد: ${added} | تکراری در صف: ${skippedDup} | قبلاً ایمپورت‌شده: ${skippedImported} | ناقص: ${skippedBad}`);
console.log(`جمع صف: ${queue.length}`);
if (dryRun) {
  console.log("(dry-run — فایل نوشته نشد)");
} else {
  fs.writeFileSync(outPath, JSON.stringify(queue, null, 1));
  console.log(`نوشته شد: ${outPath}`);
}

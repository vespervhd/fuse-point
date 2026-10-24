-- ستون منشأ متن فارسی (مرحله‌ی ترجمه، ۲۰۲۶-۱۰-۲۴) — روی دیتابیس تولید اجرا شود.
-- مقادیر: ‎'official'‎ = متن رسمی F-Droid، ‎'machine'‎ = ترجمه‌ی ماشینی (Gemini).
-- ردیف‌های قدیمی NULL می‌مانند (متن دستی/قدیمی) و هرگز برچسب «ماشینی» نمی‌خورند.
-- idempotent است (IF NOT EXISTS) و اجرای دوباره‌اش بی‌اثر است.
-- ترتیب اجرا: این فایل اول، بعد دیپلوی کد، بعد backfill-official-fa.sql و فایل‌های ترجمه‌ی ماشینی.
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "short_desc_fa_source" varchar(16);
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "description_fa_source" varchar(16);

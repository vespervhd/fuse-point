-- شمارنده‌ی دانلود materialized + ایندکس‌های جست‌وجو (اسپک بک‌اند §۵ و §۶)
-- آماده‌سازی اسلایس بک‌اند ۲ — هنوز روی هیچ دیتابیسی اجرا نشده؛ اعمال فقط از مسیر
-- برنامه‌ی ممیزی مایگریشن (قدم ۴) و همراه ثبت در ژورنال. همه‌ی قدم‌ها idempotent‌اند.

-- ۱) ستون شمارنده روی apps (پیش‌فرض ۰؛ بک‌فیل در قدم ۲)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;

-- ۲) بک‌فیل یک‌باره از رویدادهای موجود — idempotent است (محاسبه‌ی مجدد همیشه به
-- همان عدد واقعی می‌رسد) و اجرای دوباره‌اش بی‌خطر است.
UPDATE apps a
SET download_count = (SELECT count(*) FROM download_events e WHERE e.app_id = a.id);

-- ۳) ایندکس‌های مثلثی (trigram) برای جست‌وجوی ILIKE — اسپک §۶(الف)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS apps_name_fa_trgm_idx ON apps USING gin (name_fa gin_trgm_ops);
-- هم‌فرمِ عبارت replace() سمت کوئری در lib/store.ts تا پلنر بتواند از ایندکس استفاده کند
CREATE INDEX IF NOT EXISTS apps_name_fa_norm_trgm_idx ON apps USING gin ((replace(replace(replace(replace(name_fa, 'ي', 'ی'), 'ك', 'ک'), 'ة', 'ه'), '‌', ' ')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS apps_name_en_lower_trgm_idx ON apps USING gin (lower(name_en) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS apps_package_name_trgm_idx ON apps USING gin (package_name gin_trgm_ops);

-- ۴) ایندکس‌های هدفمند لیست‌ها — اسپک §۶(ب) و §۶(ج)
CREATE INDEX IF NOT EXISTS app_categories_category_idx ON app_categories (category_id);
CREATE INDEX IF NOT EXISTS apps_platform_published_updated_idx ON apps (platform, is_published, updated_at);

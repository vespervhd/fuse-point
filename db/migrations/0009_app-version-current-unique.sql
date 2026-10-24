-- تضمین حداکثر یک نسخه‌ی «فعلی» (is_current) برای هر رکورد برنامه
-- رکوردهای برنامه تک‌پلتفرمی‌اند، پس یکتایی روی app_id کافی است.
-- داده‌ی فعلی بررسی شده و هیچ app_id ای دو نسخه‌ی فعلی ندارد؛ ساخت ایندکس روی تولید امن است.
CREATE UNIQUE INDEX IF NOT EXISTS app_versions_one_current_per_app_uidx
  ON app_versions (app_id)
  WHERE is_current = true;

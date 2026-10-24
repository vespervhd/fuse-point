-- Backfill آیکن‌های خالی (idempotent — اجرای دوباره چیزی را عوض نمی‌کند)
--
-- مسئله: ۱٬۰۲۲ اپ در تولید icon_url ندارند (ویندوز ۴۵۸، لینوکس ۵۶۳، اندروید ۱).
-- راه‌حل: برای هر اپِ بی‌آیکن که وب‌سایت رسمی (source_url) دارد، آیکن را از
-- سرویس فاوآیکن گوگل برای همان دامنه می‌گیریم — دقیقاً همان قراردادی که
-- ۱٬۶۶۹ ردیفِ موجودِ جدول با آن ساخته شده‌اند:
--   https://www.google.com/s2/favicons?domain=<host>&sz=128
-- گوگل برای دامنه‌ی ناشناس هم هیچ‌وقت ۴۰۴ نمی‌دهد (کره‌ی پیش‌فرض می‌دهد)،
-- پس این backfill هیچ‌وقت تصویرِ خراب تولید نمی‌کند.
--
-- بر اساس بکاپ ۲۳ اکتبر: ۱٬۰۲۰ ردیف پر می‌شود و فقط ۲ ردیف بدون source_url
-- می‌ماند (mkvtoolnix-win و clonezilla) که کاشیِ حرف‌اول می‌گیرند.
--
-- اجرا روی تولید (توسط مالک):
--   cd ~/oblivion && set -a; . ./.env; set +a; psql "$DATABASE_URL" -f scripts/backfill-missing-icons.sql

UPDATE apps
SET icon_url = 'https://www.google.com/s2/favicons?domain='
  || regexp_replace(source_url, '^https?://([^/:]+).*$', '\1')
  || '&sz=128'
WHERE (icon_url IS NULL OR icon_url = '')
  AND source_url IS NOT NULL
  AND source_url ~ '^https?://[^/]+';

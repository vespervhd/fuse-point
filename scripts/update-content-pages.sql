-- محتوای صفحه‌های قوانین و حریم خصوصی + پاک‌سازی نام قدیمی برند از بقیه‌ی
-- صفحه‌های محتوایی. آیدی‌امپوتنت است (اجرای دوباره بی‌اثر است) و فقط روی
-- جدول content_pages کار می‌کند؛ با دیپلوی کد کاری ندارد.
--
-- اجرا روی سرور (بعد از اسکریپت آپدیت، با همان اتصال دیتابیس):
--   psql "$DATABASE_URL" -f scripts/update-content-pages.sql
--
-- نکته: متن این دو صفحه در دیتابیس است، نه در کد؛ به همین دلیل بازنویسی‌شان
-- با SQL انجام می‌شود. نسخه‌ی انگلیسی هر صفحه با پسوند ‎-en‎ در همان جدول
-- است و کامپوننت صفحه (app/page/[slug]/page.tsx) در حالت انگلیسی اول آن را
-- می‌خواند و اگر نبود، نسخه‌ی فارسی را نشان می‌دهد.

-- ۱) نام قدیمی برند در بقیه‌ی صفحه‌ها (نه terms/privacy که بدنه‌شان کامل
-- عوض می‌شود): فقط متن قابل‌مشاهده؛ شناسه‌های داخلی دست نمی‌خورند.
UPDATE content_pages
SET title = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(title,
    'نرم‌استور', 'فیوز پوینت'), 'نرم استور', 'فیوز پوینت'), 'وسپر', 'فیوز پوینت'),
    'NarmStore', 'Fuse Point'), 'Vesper', 'Fuse Point'),
  body = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(body,
    'نرم‌استور', 'فیوز پوینت'), 'نرم استور', 'فیوز پوینت'), 'وسپر', 'فیوز پوینت'),
    'NarmStore', 'Fuse Point'), 'Vesper', 'Fuse Point')
WHERE slug NOT IN ('terms', 'privacy', 'terms-en', 'privacy-en');

-- ۲) حریم خصوصی (فارسی) — بازنویسی کامل با همان واقعیت‌های سیستم:
-- آمار دانلود فقط با هش یک‌طرفه‌ی روزانه‌ی IP، بدون ذخیره‌ی IP خام؛
-- اطلاعات حساب فقط برای ارائه‌ی خدمات، بدون فروش و بدون واگذاری به ثالث.
INSERT INTO content_pages (id, slug, title, body, updated_at)
VALUES (gen_random_uuid()::text, 'privacy', 'حریم خصوصی', $fa_privacy$
فیوز پوینت یک فروشگاه اپ‌های آزاد است. این صفحه به زبان ساده می‌گوید چه داده‌ای از تو جمع می‌شود و چه داده‌ای هرگز جمع نمی‌شود.

چه داده‌ای جمع می‌کنیم
برای شمارش دانلودها، فقط یک هش یک‌طرفه‌ی روزانه از نشانی IP نگه داشته می‌شود. همین هش برای این است که یک دانلود چند بار شمرده نشود. نشانی IP خام تو هرگز ذخیره نمی‌شود و از روی هش هم نمی‌توان به آن رسید.

اگر حساب کاربری بسازی، اطلاعات حسابت فقط برای ارائه‌ی خدمات همین فروشگاه استفاده می‌شود؛ هرگز فروخته نمی‌شود و در اختیار شخص ثالث قرار نمی‌گیرد.

اگر مشکلی را گزارش کنی، متن گزارش فقط برای رسیدگی به همان موضوع خوانده و استفاده می‌شود.

تنظیمات زبان، تم و پلتفرم انتخابی‌ات روی دستگاه خودت ذخیره می‌شود، نه روی سرور ما.

چه داده‌ای جمع نمی‌کنیم
به مکان، مخاطبان یا فایل‌های دستگاهت دسترسی نداریم و چیزی از آن‌ها جمع نمی‌کنیم. ردیاب تبلیغاتی هم نداریم.

تغییر این صفحه
اگر روزی این متن تغییر کند، تاریخ به‌روزرسانی بالای همین صفحه عوض می‌شود تا بدانی چه چیزی عوض شده است.
$fa_privacy$, now())
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, body = EXCLUDED.body, updated_at = now();

-- ۳) حریم خصوصی (انگلیسی)
INSERT INTO content_pages (id, slug, title, body, updated_at)
VALUES (gen_random_uuid()::text, 'privacy-en', 'Privacy', $en_privacy$
Fuse Point is a free app store. This page says, in plain language, what data we collect from you — and what we never collect.

What we collect
To count downloads, we keep only a daily one-way hash of your IP address. The hash exists so that one download is not counted twice. Your raw IP address is never stored, and it cannot be recovered from the hash.

If you create an account, your account information is used only to provide this store's service. It is never sold and never handed to third parties.

If you report a problem, the report text is read and used only to handle that issue.

Your language, theme, and platform choices are stored on your own device, not on our server.

What we never collect
We have no access to your location, contacts, or files on your device, and we collect none of them. We run no advertising trackers.

Changes to this page
If this text ever changes, the last-updated date at the top of this page changes with it, so you can tell what changed.
$en_privacy$, now())
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, body = EXCLUDED.body, updated_at = now();

-- ۴) قوانین استفاده (فارسی) — بازنویسی کامل با همان واقعیت‌ها: اپ‌ها متعلق
-- به توسعه‌دهنده‌های خودشان‌اند و تحت لایسنس اعلام‌شده‌شان عرضه می‌شوند؛
-- فروشگاه در برابر سوءاستفاده از اپ‌ها مسئولیتی ندارد؛ گزارش به بهبود
-- فروشگاه کمک می‌کند.
INSERT INTO content_pages (id, slug, title, body, updated_at)
VALUES (gen_random_uuid()::text, 'terms', 'قوانین استفاده', $fa_terms$
فیوز پوینت چیست
فیوز پوینت فروشگاه اپ‌های آزاد برای اندروید، ویندوز و لینوکس است. برای هر اپ، اطلاعات نسخه، حجم و منبع رسمی را نشان می‌دهیم و لینک دانلود مستقیم می‌دهیم.

مالکیت اپ‌ها
همه‌ی اپ‌ها متعلق به توسعه‌دهنده‌های خودشان‌اند و تحت لایسنس اعلام‌شده‌ی خودشان عرضه می‌شوند. استفاده از هر اپ تابع همان لایسنس است و رعایت آن بر عهده‌ی خودت است.

مسئولیت استفاده
پیش از نصب هر اپ، منبع و سازگاری آن با دستگاهت را بررسی کن. فیوز پوینت در برابر سوءاستفاده از اپ‌ها یا مشکلی که از نصب آن‌ها روی دستگاهت پیش بیاید، مسئولیتی ندارد.

گزارش مشکل
اگر لینکی خراب است یا محتوایی مشکل دارد، با دکمه‌ی گزارش مشکل خبرمان کن؛ گزارش‌ها به بهتر شدن فروشگاه کمک می‌کنند.

حساب کاربری
اگر حساب ساخته‌ای، نگه‌داری از اطلاعات ورودت با خودت است.

تغییر قوانین
اگر این قوانین تغییر کند، نسخه‌ی تازه‌اش همین‌جا منتشر می‌شود و تاریخ به‌روزرسانی بالای صفحه عوض می‌شود.
$fa_terms$, now())
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, body = EXCLUDED.body, updated_at = now();

-- ۵) قوانین استفاده (انگلیسی)
INSERT INTO content_pages (id, slug, title, body, updated_at)
VALUES (gen_random_uuid()::text, 'terms-en', 'Terms of Use', $en_terms$
What Fuse Point is
Fuse Point is a free app store for Android, Windows, and Linux. For each app we show its version information, size, and official source, and we give a direct download link.

App ownership
Every app belongs to its own developers and is offered under its own declared license. Using an app is subject to that license, and respecting it is your responsibility.

Responsibility for use
Before installing any app, check its source and whether it fits your device. Fuse Point is not liable for misuse of apps or for problems that installing them causes on your device.

Reporting a problem
If a link is broken or some content is problematic, let us know with the report button; reports help improve the store.

Your account
If you created an account, keeping your login details safe is your responsibility.

Changes to these terms
If these terms change, the new version is published right here, and the last-updated date at the top of the page changes with it.
$en_terms$, now())
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, body = EXCLUDED.body, updated_at = now();

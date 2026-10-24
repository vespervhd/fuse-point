# Fuse Point | فروشگاه اپ‌های آزاد

فروشگاه نرم‌افزارهای آزاد برای اندروید، ویندوز و لینوکس.

[English](#english)

<div dir="rtl">

## درباره

Fuse Point یه فروشگاه فارسی برای پیدا کردن و دانلود نرم‌افزارهای آزاده. هر برنامه برای هر پلتفرم رکورد جدا داره و فایل‌ها از منبع رسمی خود پروژه میان؛ هش SHA-256 و مجوزهای هر نسخه هم توی صفحه‌ی همون برنامه هست تا قبل از دانلود بشه بررسی‌شون کرد.

نسخه‌ی زنده: https://fusepoint.bond

## امکانات

- کاتالوگ چندپلتفرمی؛ رکورد جدا برای نسخه‌ی اندروید، ویندوز و لینوکس هر برنامه
- نمایش هش SHA-256 و مجوزهای دسترسی هر نسخه
- گزارش مشکل برای هر برنامه، داخل صفحه‌ی خود برنامه
- حساب کاربری، علاقه‌مندی‌ها و اعلان انتشار نسخه‌ی جدید
- پنل مدیریت با لاگ حسابرسی
- همگام‌سازی روزانه با F-Droid؛ نسخه‌های جدید فقط بعد از تأیید دستی منتشر می‌شن
- PWA با پشتیبانی آفلاین

## فناوری

Next.js 16 + TypeScript · Tailwind CSS 4 · PostgreSQL 16 + Drizzle ORM · Zod · فونت Vazirmatn · آیکون‌های Lucide

## اجرا در محیط توسعه

```bash
npm install
```

یه فایل `.env` در ریشه‌ی پروژه بسازید و این دو متغیر را داخلش بذارید:

```ini
DATABASE_URL=postgres://user:password@localhost:5432/narmstore
SESSION_SECRET=<یه رشته‌ی تصادفی و بلند>
```

بعد اسکیمای دیتابیس را بسازید و سرور توسعه را اجرا کنید:

```bash
npx drizzle-kit push
npm run dev   # http://localhost:3000
```

## استقرار

نسخه‌ی production روی یه سرور Ubuntu اجرا می‌شه: PostgreSQL 16 روی خود سرور، اپ Next.js با systemd روی پورت 3000 و nginx به‌عنوان reverse proxy جلوی اون.

</div>

---

## English

Fuse Point is a Persian free-software app store for Android, Windows and Linux. Each app has a separate record per platform, files come from the project's official source, and every version shows its SHA-256 hash and permissions so you can check before you download.

Live: https://fusepoint.bond

**Features:** multi-platform catalog with per-platform records · SHA-256 hash and permissions per version · in-page issue reports · accounts, favorites and new-version notifications · admin panel with audit log · daily F-Droid sync (new versions publish only after manual approval) · offline-ready PWA

**Stack:** Next.js 16 + TypeScript · Tailwind CSS 4 · PostgreSQL 16 + Drizzle ORM · Zod · Vazirmatn font · Lucide icons

**Development:**

```bash
npm install
# create a .env file with DATABASE_URL and SESSION_SECRET
npx drizzle-kit push
npm run dev   # http://localhost:3000
```

**Deployment:** production runs on an Ubuntu VPS — PostgreSQL 16 on the box, the Next.js app under systemd on port 3000, and nginx as reverse proxy in front of it.

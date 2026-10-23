<div align="center">

```
██╗   ██╗███████╗███████╗██████╗ ███████╗██████╗
██║   ██║██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗
██║   ██║█████╗  ███████╗██████╔╝█████╗  ██████╔╝
╚██╗ ██╔╝██╔══╝  ╚════██║██╔═══╝ ██╔══╝  ██╔══██╗
 ╚████╔╝ ███████╗███████║██║     ███████╗██║  ██║
  ╚═══╝  ╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝
```

# Fuse Point

**فروشگاه اپ‌های آزاد** — A Persian app store for Android, Windows and Linux.

[فارسی](#فارسی) | [English](#english)

</div>

---

## فارسی

<div dir="rtl">

Fuse Point یه فروشگاه فارسی برای معرفی و دانلود امن نرم‌افزاره — اندروید، ویندوز و لینوکس. یه پروژه‌ی شخصیه که از یه ایده‌ی ساده شروع شد: نرم‌افزار خوب، به زبان خودت.

۲٬۳۶۸ برنامه‌ی واقعی (اندروید ۸۲۶، لینوکس ۸۲۳، ویندوز ۷۱۹) از F-Droid و گیت‌هاب — بدون تبلیغ، بدون آمار جعلی. اعتماد اولویت اوله: هش SHA-256 هر فایل، لینک منبع رسمی، و دکمه‌ی گزارش مشکل توی خود صفحه‌ی هر برنامه.

نسخه‌ی زنده: https://narmstore.onrender.com

### ویژگی‌ها

- ویترین کاملاً فارسی و راست‌چین، با سوییچر پلتفرم (اندروید / ویندوز / لینوکس)
- دانلود هوشمند: لینک مستقیم APK یا صفحه‌ی رسمی/گیت‌هاب، با شمارش واقعی دانلود (هش روزانه‌ی IP، بدون ذخیره‌ی IP خام)
- هش SHA-256 هر فایل با دکمه‌ی کپی
- کارت گیت‌هاب با تعداد استار
- علاقه‌مندی، دنبال‌کردن برنامه‌ها و اعلان انتشار نسخه‌ی جدید
- دراور نسخه‌های قبلی و جست‌وجوی فارسی با نرمال‌سازی
- چهار تم: روشن / تیره / گرم / امولد
- PWA با پشتیبانی آفلاین
- همگام‌سازی روزانه‌ی F-Droid — نسخه‌های جدید فقط با تأیید دستی منتشر می‌شن
- پنل ادمین با لاگ حسابرسی
- امنیت: scrypt، نشست HMAC، محدودسازی نرخ، اعتبارسنجی Zod

### تکنولوژی‌ها

**Next.js 16** + TypeScript · **Tailwind CSS 4** · **PostgreSQL 16** + Drizzle ORM · Zod · فونت Vazirmatn · آیکون‌های Lucide

### اجرای محلی

```bash
npm install
cp .env.example .env        # DATABASE_URL و SESSION_SECRET را تنظیم کن
npx drizzle-kit migrate
npx tsx --env-file=.env db/seed.ts
npm run dev                 # http://localhost:3000
```

### دیپلوی و نگهداری

- استقرار روی Render با `render.yaml` (وب‌سرویس + دیتابیس)
- سینک روزانه‌ی F-Droid و بکاپ خودکار دیتابیس (۷ نسخه‌ی آخر نگه داشته می‌شه) با `scripts/backup-cloud-db.mjs` و `scripts/restore-cloud-db.mjs`
- برنامه‌ی خروج از Render در `docs/render-exit-plan.md`

### مجوز

MIT

</div>

---

## English

Fuse Point is a Persian store for discovering and safely downloading software — Android, Windows and Linux. A personal project that started from a simple idea: good software, in your own language.

2,368 real apps (Android 826, Linux 823, Windows 719) sourced from F-Droid and GitHub — no ads, no fake stats. Trust comes first: SHA-256 hash per file, official source links, and in-page issue reporting on every app page.

Live: https://narmstore.onrender.com

### Features

- Fully Persian RTL storefront with a platform switcher (Android / Windows / Linux)
- Smart downloads: direct APK link or official/GitHub page, with real download counts (daily-hashed IP, no raw IPs stored)
- SHA-256 hash per file with a copy button
- GitHub card with star count
- Favorites, app follows and new-version notifications
- Previous-versions drawer and normalized Persian search
- Four themes: light / dark / warm / amoled
- Offline-ready PWA
- Daily F-Droid sync — new versions only publish after manual approval
- Admin panel with audit log
- Security: scrypt, HMAC sessions, rate limiting, Zod validation

### Tech stack

**Next.js 16** + TypeScript · **Tailwind CSS 4** · **PostgreSQL 16** + Drizzle ORM · Zod · Vazirmatn font · Lucide icons

### Getting started

```bash
npm install
cp .env.example .env        # set DATABASE_URL and SESSION_SECRET
npx drizzle-kit migrate
npx tsx --env-file=.env db/seed.ts
npm run dev                 # http://localhost:3000
```

### Deploy & maintenance

- Deploys on Render via `render.yaml` (web service + database)
- Daily F-Droid sync and automatic database backups (last 7 kept) with `scripts/backup-cloud-db.mjs` and `scripts/restore-cloud-db.mjs`
- Render exit plan in `docs/render-exit-plan.md`

### License

MIT

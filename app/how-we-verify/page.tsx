import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Hash, Link2, Flag, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "چطور برنامه‌ها را بررسی می‌کنیم",
  description: "روش بررسی امنیتی Fuse Point: هش SHA-256، لینک منبع رسمی، و چطور خودتان صحت فایل را تأیید کنید.",
};

const steps = [
  {
    icon: Link2,
    title: "۱. فقط از منبع رسمی",
    text: "هر برنامه فقط از وب‌سایت رسمی پروژه، مخزن گیت‌هاب آن، یا مخزن F-Droid برداشته می‌شود. لینک منبع در صفحه‌ی هر برنامه مشخص است تا خودتان هم بتوانید بررسی کنید.",
  },
  {
    icon: Hash,
    title: "۲. هش SHA-256 ثبت می‌شود",
    text: "برای هر فایل، هش SHA-256 از منبع رسمی ثبت می‌شود و در صفحه‌ی برنامه نمایش داده می‌شود. اگر فایل دست‌کاری شده باشد، هش آن با هش ثبت‌شده فرق می‌کند.",
  },
  {
    icon: ShieldCheck,
    title: "۳. چطور خودتان تأیید کنید",
    text: "بعد از دانلود، هش فایل را با ابزارهای رایگان (مثل certutil در ویندوز یا sha256sum در لینوکس) حساب کنید و با هش نمایش‌داده‌شده در صفحه‌ی برنامه مقایسه کنید. اگر یکی بود، فایل سالم است.",
  },
  {
    icon: Flag,
    title: "۴. گزارش شما",
    text: "اگر لینکی خراب بود، هش نمی‌خواند، یا برنامه‌ای مشکوک به نظر رسید، دکمه‌ی «گزارش مشکل» در صفحه‌ی هر برنامه مستقیم به تیم ما می‌رسد و بررسی می‌شود.",
  },
];

export default function HowWeVerify() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <ShieldCheck className="w-14 h-14 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">چطور برنامه‌ها را بررسی می‌کنیم</h1>
        <p className="text-muted-foreground">
          اعتماد شعار ماست، نه فقط یک کلمه. این‌جا دقیقاً توضیح می‌دهیم هر برنامه قبل از انتشار چه مسیری را طی می‌کند.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s) => (
          <section
            key={s.title}
            className="bg-card border border-border rounded-3xl p-6 flex gap-4"
          >
            <s.icon className="w-8 h-8 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-extrabold mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-7">{s.text}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-8 bg-primary/10 border border-primary/30 rounded-3xl p-6">
        <h2 className="font-extrabold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" />
          قول ما
        </h2>
        <ul className="text-sm text-muted-foreground leading-7 space-y-1">
          <li>• هیچ آمار دانلودی جعل نمی‌کنیم — عددی که می‌بینید واقعی است.</li>
          <li>• هیچ برنامه‌ای بدون لینک منبع مشخص منتشر نمی‌شود.</li>
          <li>• گزارش‌های شما خوانده و پیگیری می‌شود.</li>
        </ul>
      </section>

      <div className="text-center mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );
}

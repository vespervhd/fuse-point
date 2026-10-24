import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Smartphone, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "راهنمای نصب APK در اندروید",
  description: "آموزش قدم‌به‌قدم نصب فایل APK در اندروید: دانلود از Fuse Point، فعال‌سازی نصب از منابع ناشناس، و تأیید هش.",
};

const steps = [
  {
    title: "۱. فایل APK را دانلود کنید",
    text: "در صفحه‌ی برنامه، دکمه‌ی «دانلود نسخه» را بزنید. فایل با لینک مستقیم و شمارش واقعی دانلود می‌شود.",
  },
  {
    title: "۲. نصب از منابع ناشناس را فعال کنید",
    text: "اندروید برای امنیت، نصب از خارج از گوگل‌پلی را محدود می‌کند. وقتی فایل را باز می‌کنید، سیستم خودش راهنمایی‌تان می‌کند: فقط برای مرورگر یا فایل‌منجر خودتان اجازه بدهید، نه برای همه.",
  },
  {
    title: "۳. فایل را نصب کنید",
    text: "روی فایل دانلودشده بزنید و «نصب» را تأیید کنید. دسترسی‌هایی که برنامه می‌خواهد را بخوانید — اگر چیزی عجیب بود، نصب نکنید.",
  },
  {
    title: "۴. (اختیاری) هش را بررسی کنید",
    text: "برای اطمینان بیشتر، هش SHA-256 نمایش‌داده‌شده در صفحه‌ی برنامه را با هش فایل دانلودشده مقایسه کنید. آموزش کامل در صفحه‌ی «چطور بررسی می‌کنیم».",
  },
];

export default function InstallApkGuide() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/guides" className="inline-flex items-center gap-1 text-sm text-primary font-bold mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> همه‌ی راهنماها
      </Link>
      <div className="text-center mb-10">
        <Smartphone className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">راهنمای نصب APK در اندروید</h1>
        <p className="text-muted-foreground">در ۴ قدم ساده، هر برنامه‌ای را از Fuse Point نصب کنید.</p>
      </div>
      <div className="space-y-4">
        {steps.map((s) => (
          <section key={s.title} className="bg-card border border-border rounded-3xl p-6">
            <h2 className="font-extrabold mb-2">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-7">{s.text}</p>
          </section>
        ))}
      </div>
      <div role="note" className="mt-6 bg-warning/10 border border-warning/30 rounded-3xl p-6 flex gap-3">
        <AlertTriangle className="w-6 h-6 shrink-0 text-warning" aria-hidden="true" />
        <p className="text-sm leading-7">
          <b>نکته‌ی امنیتی:</b> فقط از Fuse Point یا وب‌سایت رسمی پروژه دانلود کنید. فایل APK از کانال‌های ناشناس تلگرام یا سایت‌های متفرقه ممکن است دست‌کاری شده باشد.
        </p>
      </div>
      <div className="mt-6 text-center">
        <Link href="/how-we-verify" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> چطور برنامه‌ها را بررسی می‌کنیم
        </Link>
      </div>
    </div>
  );
}

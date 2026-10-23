import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Monitor, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "راهنمای نصب برنامه در ویندوز | Fuse Point",
  description: "آموزش نصب امن برنامه در ویندوز: از وب‌سایت رسمی یا گیت‌هاب، بدون نرم‌افزارهای تبلیغاتی.",
};

const steps = [
  {
    title: "۱. فقط از لینک رسمی دانلود کنید",
    text: "در صفحه‌ی هر برنامه در Fuse Point، دکمه شما را به وب‌سایت رسمی پروژه یا صفحه‌ی گیت‌هاب آن می‌برد. از همین‌جا دانلود کنید — نه از سایت‌های دانلود متفرقه که نسخه‌های دست‌کاری‌شده با تبلیغات می‌دهند.",
  },
  {
    title: "۲. فایل نصب را اجرا کنید",
    text: "معمولاً یک فایل .exe یا .msi است. روی آن دابل‌کلیک کنید و مراحل نصب را پیش بروید. اگر ویندوز هشدار SmartScreen داد، مطمئن شوید فایل را از منبع رسمی گرفته‌اید.",
  },
  {
    title: "۳. نسخه‌ی پرتابل را امتحان کنید",
    text: "خیلی از برنامه‌ها نسخه‌ی پرتابل (بدون نصب) هم دارند — معمولاً فایل ZIP است که فقط بازش می‌کنید و اجرا. برای امتحان کردن برنامه عالی است.",
  },
];

export default function InstallWindowsGuide() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/guides" className="inline-flex items-center gap-1 text-sm text-primary font-bold mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> همه‌ی راهنماها
      </Link>
      <div className="text-center mb-10">
        <Monitor className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">راهنمای نصب برنامه در ویندوز</h1>
        <p className="text-muted">نصب امن در ۳ قدم، بدون باندل‌های تبلیغاتی.</p>
      </div>
      <div className="space-y-4">
        {steps.map((s) => (
          <section key={s.title} className="bg-surface border border-border rounded-3xl p-6">
            <h2 className="font-extrabold mb-2">{s.title}</h2>
            <p className="text-sm text-muted leading-7">{s.text}</p>
          </section>
        ))}
      </div>
      <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex gap-3">
        <AlertTriangle className="w-6 h-6 shrink-0 text-amber-500" aria-hidden="true" />
        <p className="text-sm leading-7">
          <b>هشدار:</b> موقع نصب، تیک گزینه‌های اضافی (نوار ابزار، تغییر موتور جست‌وجو) را بردارید. برنامه‌های تمیز این‌ها را ندارند، ولی همیشه حواس‌تان باشد.
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

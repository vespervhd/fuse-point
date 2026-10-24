import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Terminal, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "راهنمای نصب برنامه در لینوکس",
  description: "آموزش نصب برنامه در لینوکس: از مخزن رسمی، فلت‌هاب، یا فایل دانلودشده.",
};

const steps: { title: string; text: string; code?: string[] }[] = [
  {
    title: "۱. اول از مخزن رسمی توزیع خودتان بگیرید",
    text: "راحت‌ترین راه: با مدیر بسته‌ی توزیع خودتان (مثل apt در اوبونتو یا dnf در فدورا) برنامه را نصب کنید. این امن‌ترین روش است چون بسته‌ها امضای رسمی دارند.",
    code: ["sudo apt install vlc", "sudo dnf install vlc"],
  },
  {
    title: "۲. فلت‌هاب برای برنامه‌های جدیدتر",
    text: "اگر نسخه‌ی مخزن قدیمی بود، فلت‌هاب (Flathub) نسخه‌های به‌روز را با یک کلیک نصب می‌کند. خیلی از برنامه‌های Fuse Point لینک فلت‌هاب دارند.",
    code: ["flatpak install flathub org.videolan.VLC"],
  },
  {
    title: "۳. نصب از گیت‌هاب",
    text: "در صفحه‌ی هر برنامه، لینک گیت‌هاب به صفحه‌ی ریلیزها می‌رود. فایل مناسب توزیع خودتان (معمولاً .deb یا .AppImage) را دانلود کنید. AppImage بدون نصب اجرا می‌شود.",
  },
];

export default function InstallLinuxGuide() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/guides" className="inline-flex items-center gap-1 text-sm text-primary font-bold mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> همه‌ی راهنماها
      </Link>
      <div className="text-center mb-10">
        <Terminal className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">راهنمای نصب برنامه در لینوکس</h1>
        <p className="text-muted">سه روش اصلی نصب برنامه در لینوکس، از ساده به پیشرفته.</p>
      </div>
      <div className="space-y-4">
        {steps.map((s) => (
          <section key={s.title} className="card bg-base-200 shadow-sm">
            <div className="card-body p-6">
              <h2 className="font-extrabold mb-2">{s.title}</h2>
              <p className="text-sm opacity-70 leading-7">{s.text}</p>
              {s.code && (
                <div className="mockup-code mt-4 text-sm" dir="ltr">
                  {s.code.map((c) => (
                    <pre key={c} data-prefix="$"><code>{c}</code></pre>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link href="/how-we-verify" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> چطور برنامه‌ها را بررسی می‌کنیم
        </Link>
      </div>
    </div>
  );
}

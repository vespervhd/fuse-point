import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Terminal, CheckCircle2 } from "lucide-react";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = STR[locale];
  return {
    title: d.ext_guideLinuxTitle,
    description: d.ext_guideLinuxMetaDesc,
  };
}

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

export default async function InstallLinuxGuide() {
  const locale = await getLocale();
  const d = STR[locale];
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/guides" className="inline-flex items-center gap-1 text-sm text-primary font-bold mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {d.ext_allGuides}
      </Link>
      <div className="text-center mb-10">
        <Terminal className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">{d.ext_guideLinuxTitle}</h1>
        <p className="text-muted-foreground">{d.ext_guideLinuxSub}</p>
      </div>
      <div className="space-y-4">
        {steps.map((s) => (
          <section key={s.title} className="bg-card border border-border rounded-3xl shadow-sm p-6">
            <h2 className="font-extrabold mb-2">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-7">{s.text}</p>
            {s.code && (
              <div className="mt-4 bg-muted border border-border rounded-xl p-4 text-sm space-y-1.5" dir="ltr">
                {s.code.map((c) => (
                  <pre key={c} className="flex gap-2"><span className="text-muted-foreground select-none" aria-hidden="true">$</span><code>{c}</code></pre>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link href="/how-we-verify" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> {d.ext_howWeVerify}
        </Link>
      </div>
    </div>
  );
}

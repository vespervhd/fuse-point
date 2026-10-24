import type { Metadata } from "next";
import { Globe, Fingerprint, ClipboardCheck, Flag, EyeOff, type LucideIcon } from "lucide-react";
import { BackLink, ViewHead } from "@/components/Bits";
import { getLocale } from "@/lib/i18n-server";
import { STR, type Locale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: STR[locale].whyTitle,
    description: locale === "fa"
      ? "روش کار Fuse Point: منبع رسمی، هش SHA-256، بازبینی پیش از انتشار، گزارش مشکل، بدون تبلیغ و ردیاب."
      : "How Fuse Point works: official sources, SHA-256 hashes, review before publishing, issue reports, no ads or trackers.",
  };
}

type Block = { Icon: LucideIcon; fa: [string, string]; en: [string, string] };

const BLOCKS: Block[] = [
  {
    Icon: Globe,
    fa: ["منبع رسمی", "لینک دانلود هر برنامه از منبع سازنده‌ش میاد؛ وب‌سایت رسمی یا صفحه‌ی رسمی پروژه. نسخه‌ی دست‌کاری‌شده جایی نداره."],
    en: ["Official source", "Every download link comes from the maker's own source — the official website or the project's official page. No tampered builds."],
  },
  {
    Icon: Fingerprint,
    fa: ["هش SHA-256", "برای هر فایل، اثر انگشت دیجیتال‌ش (SHA-256) رو کنارش می‌گذاریم تا خودت قبلِ نصب، فایل رو با نسخه‌ی اصلی تطبیق بدی."],
    en: ["SHA-256 hash", "Every file ships with its digital fingerprint (SHA-256) next to it, so you can match the file against the original before installing."],
  },
  {
    Icon: ClipboardCheck,
    fa: ["بازبینی پیش از انتشار", "هیچ برنامه‌ای خودکار و بدون بررسی وارد فروشگاه نمی‌شه. هر ورودی قبل از انتشار از نظر منبع، مجوزها و سلامت فایل بازبینی می‌شه."],
    en: ["Reviewed before publishing", "Nothing enters the store automatically. Every entry is reviewed for its source, permissions and file health before it goes live."],
  },
  {
    Icon: Flag,
    fa: ["گزارش مشکل", "روی صفحه‌ی هر برنامه دکمه‌ی «گزارش مشکل» هست. گزارش‌ت مستقیم می‌رسه دست ما و بررسی می‌شه."],
    en: ["Report an issue", "Every app page has a “Report an issue” button. Your report comes straight to us and gets reviewed."],
  },
  {
    Icon: EyeOff,
    fa: ["بدون تبلیغ و ردیاب", "نه تبلیغ داریم، نه ردیابِ رفتار، نه فروش داده. فیوز پوینت فقط یه فروشگاهه و همون می‌مونه."],
    en: ["No ads, no trackers", "No ads, no behavior trackers, no selling data. Fuse Point is just a store, and it stays one."],
  },
];

// صفحه‌ی اعتماد «چرا فیوز پوینت؟» — پنج بلوک روش کار، عین نمونه
export default async function TrustPage() {
  const locale: Locale = await getLocale();
  const d = STR[locale];
  return (
    <div className="animate-fade-up">
      <BackLink href="/" label={d.backStore} />
      <ViewHead title={d.whyTitle} sub={d.whySub} />
      <div className="flex flex-col gap-3">
        {BLOCKS.map(({ Icon, fa, en }) => {
          const [title, text] = locale === "fa" ? fa : en;
          return (
            <article key={title} className="flex gap-3.5 bg-card border border-border rounded-[18px] p-[18px]">
              <span className="w-[46px] h-[46px] shrink-0 rounded-[13px] grid place-items-center text-primary bg-primary/10 border border-primary/[0.22]">
                <Icon className="w-[23px] h-[23px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[15.5px] font-extrabold mb-1">{title}</h2>
                <p className="text-muted-foreground text-[13px] leading-[1.95] m-0">{text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

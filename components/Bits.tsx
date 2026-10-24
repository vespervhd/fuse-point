import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import CurrentDivider from "@/components/fx/CurrentDivider";
import { STR, type Locale } from "@/lib/i18n";

// تیتر بخش + جداکننده‌ی جریان (عین نمونه)
export function SectionHead({ title, locale }: { title: string; locale: Locale }) {
  return (
    <div className="flex items-center gap-3.5 mb-4">
      <h2 className="text-xl font-extrabold whitespace-nowrap">{title}</h2>
      <CurrentDivider />
    </div>
  );
}

// دکمه‌ی بازگشت قرصی بالای نماها
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-[7px] mt-[18px] border border-border bg-card text-foreground rounded-full px-4 py-2 text-[13.5px] font-bold min-h-[44px]"
    >
      <span className="flip-x grid place-items-center" aria-hidden="true">
        <ArrowRight className="w-[17px] h-[17px]" strokeWidth={2} />
      </span>
      {label}
    </Link>
  );
}

// تیتر و زیرعنوان نماها
export function ViewHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <h1 className="text-[22px] font-black mt-[18px] mx-0.5 mb-1">{title}</h1>
      {sub && <p className="text-muted-foreground text-[13px] mx-0.5 mb-[18px] leading-[1.9]">{sub}</p>}
    </>
  );
}

// حالت خالی نماها — کادر نقطه‌چین + آیکن + متن + دکمه
export function EmptyState({
  icon, text, sub, action,
}: {
  icon: ReactNode; text: string; sub?: string; action?: ReactNode;
}) {
  return (
    <div className="text-center text-muted-foreground py-[38px] px-4 border border-dashed border-border rounded-2xl">
      <div className="w-[52px] h-[52px] mx-auto mb-3 rounded-[15px] grid place-items-center text-primary bg-primary/10 border border-primary/[0.22]">
        {icon}
      </div>
      <p className="m-0 mb-3.5 text-[14.5px] leading-[1.9] text-foreground/80">{text}</p>
      {sub && <p className="m-0 mb-3.5 text-[13px] leading-[1.9]">{sub}</p>}
      {action}
    </div>
  );
}

export function clearBtnClass() {
  return "inline-flex items-center border border-border bg-transparent text-primary rounded-full px-4 py-[9px] text-[13px] font-bold min-h-[44px]";
}

export { STR };
export type { Locale };

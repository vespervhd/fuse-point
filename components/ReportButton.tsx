"use client";

// دکمه‌ی «گزارش مشکل» — فقط ماشه‌ی سبک در باندلِ اولیه است؛ فرمِ دیالوگ با
// next/dynamic فقط موقعِ کلیک بارگذاری می‌شود. دو رشته‌ی زیر عمداً در این فایل
// تکرار شده تا import از ReportDialog باندلِ دیالوگ را استاتیک نکند.
import { useState } from "react";
import dynamic from "next/dynamic";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

const ReportDialog = dynamic(() => import("./ReportDialog"), { ssr: false });

const COPY = {
  fa: { done: "گزارش شما ثبت شد، بررسی می‌کنیم", trigger: "گزارش مشکل" },
  en: { done: "Report received — we'll look into it", trigger: "Report an issue" },
} as const;

export default function ReportButton({
  appId, appName, triggerClassName, triggerIcon, locale = "fa",
}: {
  appId: string; appName: string;
  triggerClassName?: string; triggerIcon?: React.ReactNode;
  locale?: Locale;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const c = COPY[locale];

  if (done) {
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Flag className="w-4 h-4" /> {c.done}
      </p>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerIcon ?? <Flag className="w-4 h-4" />} {c.trigger}
      </Button>
      {open && (
        <ReportDialog
          appId={appId}
          appName={appName}
          locale={locale}
          onClose={() => setOpen(false)}
          onDone={() => { setDone(true); setOpen(false); }}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { X, Download, ShieldCheck, FileDown, Globe, Hash, ChevronLeft } from "lucide-react";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { formatBytes } from "@/lib/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

export type DownloadOption = {
  label: string;
  href: string;
  external?: boolean;
  detail?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  appName: string;
  iconUrl: string | null;
  versionName: string | null;
  fileSize: number | null;
  sha256: string | null;
  sourceLabel: string;
  options: DownloadOption[];
};

// باتم‌شیت دانلود — روی ui Sheet (باز/بسته‌شدن با پراپ‌های open/onClose مثل قبل)
export default function DownloadSheet({
  open, onClose, appName, iconUrl, versionName, fileSize, sha256, sourceLabel, options,
}: Props) {
  const [showHash, setShowHash] = useState(false);

  const primary = options[0];
  const rest = options.slice(1);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-label={`دانلود ${appName}`}
        className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-[28px] px-6 pt-3 pb-8 sm:mx-0 sm:max-w-none"
      >
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" aria-hidden="true" />
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="بستن"
            className="absolute top-4 left-4 rounded-full"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </SheetClose>

        {/* سربرگ اپ */}
        <div className="flex items-center gap-4 mb-6">
          {iconUrl ? (
            <PxImg src={px(iconUrl) || iconUrl} alt="" width={72} height={72} className="w-[72px] h-[72px] rounded-[22%] object-cover shadow-lg shrink-0" />
          ) : (
            <span className="w-[72px] h-[72px] rounded-[22%] bg-primary/10 text-primary grid place-items-center text-3xl font-extrabold shrink-0" aria-hidden="true">
              {(appName || "?").trim().charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <SheetTitle asChild>
              <h2 className="font-extrabold text-lg leading-7 truncate">{appName}</h2>
            </SheetTitle>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {versionName && (
                <span dir="ltr" className="text-sm text-muted-foreground font-bold">{versionName}</span>
              )}
              <Badge className="gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-extrabold text-success hover:bg-success/10">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> پایدار
              </Badge>
            </div>
          </div>
        </div>

        {/* جزئیات فایل */}
        <dl className="bg-muted rounded-2xl divide-y divide-border mb-5 text-sm">
          {fileSize ? (
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="inline-flex items-center gap-2 text-muted-foreground"><FileDown className="w-4 h-4" aria-hidden="true" /> حجم فایل</dt>
              <dd className="font-bold" dir="ltr">{formatBytes(fileSize)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="inline-flex items-center gap-2 text-muted-foreground"><Globe className="w-4 h-4" aria-hidden="true" /> منبع</dt>
            <dd className="font-bold">{sourceLabel}</dd>
          </div>
          {sha256 && (
            <div className="px-4 py-3">
              <Button variant="ghost" onClick={() => setShowHash(!showHash)} className="w-full justify-between">
                <span className="inline-flex items-center gap-2 text-muted-foreground"><Hash className="w-4 h-4" aria-hidden="true" /> هش SHA-256</span>
                <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${showHash ? "-rotate-90" : ""}`} aria-hidden="true" />
              </Button>
              {showHash && (
                <dd dir="ltr" className="mt-2 text-[11px] font-mono break-all text-muted-foreground bg-card rounded-xl p-3 select-all">{sha256}</dd>
              )}
            </div>
          )}
        </dl>

        {/* دکمه‌ی اصلی */}
        {primary && (
          <Button asChild size="lg" className="w-full mb-3">
            <a
              href={primary.href}
              {...(primary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              دانلود {versionName ? <span dir="ltr">{versionName}</span> : null}
            </a>
          </Button>
        )}

        {/* گزینه‌های بیشتر */}
        {rest.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-bold px-1 mt-2">گزینه‌های بیشتر</p>
            {rest.map((o) => (
              <Button asChild key={o.label} variant="ghost" className="group h-auto w-full justify-between py-3">
                <a
                  href={o.href}
                  {...(o.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span>
                    <span className="block font-bold text-sm group-hover:text-primary transition">{o.label}</span>
                    {o.detail && <span className="block text-xs text-muted-foreground mt-0.5">{o.detail}</span>}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </a>
              </Button>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center mt-5 leading-5">
          دانلود از منبع رسمی انجام می‌شود. هش فایل را می‌توانید با مقدار بالا مقایسه کنید.
        </p>
      </SheetContent>
    </Sheet>
  );
}

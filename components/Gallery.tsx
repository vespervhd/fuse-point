"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import PxImg from "@/components/PxImg";
import { STR, num, type Locale } from "@/lib/i18n";

// لایت‌باکس (و کدِ Radix Dialog) فقط وقتی کاربر روی اسکرین‌شات کلیک می‌کند بارگذاری می‌شود
const GalleryLightbox = dynamic(() => import("./GalleryLightbox"), { ssr: false });

type Shot = { id: string; url: string };

function Spinner({ label }: { label: string }) {
  return (
    <div
      className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin"
      role="status"
      aria-label={label}
    />
  );
}

export default function Gallery({ shots, appName, locale = "fa" }: { shots: Shot[]; appName: string; locale?: Locale }) {
  const d = STR[locale];
  const rtl = locale === "fa";
  const [open, setOpen] = useState<number | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((delta: number) => {
    setOpen((i) => (i === null ? i : (i + delta + shots.length) % shots.length));
  }, [shots.length]);

  // ریست وضعیت + پیش‌بارگذاری تصاویر هنگام باز شدن/جابه‌جایی لایت‌باکس
  useEffect(() => {
    if (open === null) return;
    setFailedUrl(null);
    setRetry(0);
    // پیش‌بارگذاری همه‌ی اسکرین‌شات‌ها تا جابه‌جایی بدون مکث باشد
    shots.forEach((s) => {
      const im = new Image();
      im.src = s.url;
    });
  }, [open, shots]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // در RTL چپ = بعدی، در LTR چپ = قبلی
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
      if (e.key === "ArrowRight") step(rtl ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step, rtl]);

  if (!shots.length) return null;

  const current = open !== null ? shots[open] : null;
  const failed = !!current && failedUrl === current.url;
  const fill = (tpl: string, i: number, n?: number) =>
    tpl.replace("{i}", num(i, locale)).replace("{n}", num(n ?? shots.length, locale)).replace("{name}", appName);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto rounded-xl pb-2 select-none scrollbar-none" style={{ touchAction: "pan-x pan-y" }}>
        {shots.map((sh, i) => (
          <button key={sh.id} onClick={() => setOpen(i)}
            className="pressable shrink-0 rounded-xl overflow-hidden border border-border hover:border-primary/50"
            aria-label={fill(d.galView, i + 1)}>
            <PxImg src={sh.url} alt={fill(d.galImgAlt, i + 1)} width={180} height={320}
              className="h-64 w-auto object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null && (
        <GalleryLightbox
          open={open}
          shots={shots}
          appName={appName}
          locale={locale}
          failed={failed}
          retry={retry}
          onClose={close}
          onStep={step}
          onSelect={setOpen}
          onRetry={() => { setFailedUrl(null); setRetry((r) => r + 1); }}
          onImageError={() => { if (current) setFailedUrl(current.url); }}
        />
      )}
    </>
  );
}

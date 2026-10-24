"use client";

import { useState, useEffect, useCallback } from "react";
import PxImg from "@/components/PxImg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Shot = { id: string; url: string };

function Spinner() {
  return (
    <div
      className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin"
      role="status"
      aria-label="در حال بارگذاری تصویر"
    />
  );
}

export default function Gallery({ shots, appName }: { shots: Shot[]; appName: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => {
    setOpen((i) => (i === null ? i : (i + d + shots.length) % shots.length));
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
      if (e.key === "ArrowLeft") step(1);   // RTL: چپ = بعدی
      if (e.key === "ArrowRight") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  if (!shots.length) return null;

  const current = open !== null ? shots[open] : null;
  const failed = !!current && failedUrl === current.url;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto rounded-xl pb-2 select-none scrollbar-none" style={{ touchAction: "pan-x pan-y" }}>
        {shots.map((sh, i) => (
          <button key={sh.id} onClick={() => setOpen(i)}
            className="pressable shrink-0 rounded-xl overflow-hidden border border-border hover:border-primary/50"
            aria-label={`مشاهده تصویر ${i + 1} از ${appName}`}>
            <PxImg src={sh.url} alt={`تصویر ${appName}`} width={180} height={320}
              className="h-64 w-auto object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => { if (!o) close(); }}>
        <DialogContent
          showCloseButton={false}
          aria-label={`گالری ${appName}`}
          className="top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black/95 p-0 text-white shadow-none sm:max-w-none data-[state=open]:animate-[fade-in_0.2s_ease] data-[state=closed]:animate-[fade-out_0.2s_ease]"
        >
          <DialogTitle className="sr-only">{`گالری ${appName}`}</DialogTitle>
          {current && (
            <>
              <div className="flex items-center justify-between p-4 text-white">
                <span className="text-sm font-bold">{appName} — {open! + 1} از {shots.length}</span>
                <Button onClick={close} variant="ghost" size="icon" aria-label="بستن"
                  className="rounded-full text-white hover:bg-white/20 hover:text-white">
                  ✕
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 px-2 pb-4 min-h-0">
                <Button onClick={() => step(-1)} variant="ghost" size="icon" aria-label="قبلی"
                  className="size-11 shrink-0 rounded-full text-white hover:bg-white/20 hover:text-white z-10">
                  ›
                </Button>
                <div className="flex-1 flex items-center justify-center min-h-0 h-full relative">
                  {failed ? (
                    <div className="flex flex-col items-center gap-3 text-white/80">
                      <span className="text-sm">تصویر بارگذاری نشد</span>
                      <Button
                        variant="ghost"
                        onClick={() => { setFailedUrl(null); setRetry((r) => r + 1); }}
                        className="rounded-full text-white hover:bg-white/20 hover:text-white">
                        تلاش مجدد
                      </Button>
                    </div>
                  ) : (
                    <img
                      key={`${current.id}-${retry}`}
                      src={current.url}
                      alt={`تصویر ${open! + 1} از ${appName}`}
                      loading="eager"
                      decoding="async"
                      className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                      onError={() => setFailedUrl(current.url)}
                    />
                  )}
                </div>
                <button onClick={() => step(1)} aria-label="بعدی"
                  className="w-11 h-11 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition z-10">
                  ‹
                </button>
              </div>
              <div className="flex justify-center gap-2 pb-6">
                {shots.map((sh, i) => (
                  <button key={sh.id} onClick={() => setOpen(i)} aria-label={`تصویر ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition ${i === open ? "bg-white scale-125" : "bg-white/30 hover:bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

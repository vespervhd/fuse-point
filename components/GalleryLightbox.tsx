"use client";

// لایت‌باکسِ گالری — جدا از Gallery تا کدِ Radix Dialog فقط وقتی کاربر روی
// اسکرین‌شات کلیک می‌کند بارگذاری شود، نه در باندلِ اولیه‌ی صفحه‌ی اپ.
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { STR, num, type Locale } from "@/lib/i18n";

type Shot = { id: string; url: string };

export default function GalleryLightbox({ open, shots, appName, locale, failed, retry, onClose, onStep, onSelect, onRetry, onImageError }: {
  open: number | null;
  shots: Shot[];
  appName: string;
  locale: Locale;
  failed: boolean;
  retry: number;
  onClose: () => void;
  onStep: (delta: number) => void;
  onSelect: (i: number) => void;
  onRetry: () => void;
  onImageError: () => void;
}) {
  const d = STR[locale];
  const rtl = locale === "fa";
  const current = open !== null ? shots[open] : null;
  const fill = (tpl: string, i: number, n?: number) =>
    tpl.replace("{i}", num(i, locale)).replace("{n}", num(n ?? shots.length, locale)).replace("{name}", appName);
  return (
    <Dialog open={open !== null} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        aria-label={`${d.preview} ${appName}`}
        className="top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black/95 p-0 text-white shadow-none sm:max-w-none data-[state=open]:animate-[fade-in_0.2s_ease] data-[state=closed]:animate-[fade-out_0.2s_ease]"
      >
        <DialogTitle className="sr-only">{`${d.preview} ${appName}`}</DialogTitle>
        {current && (
          <>
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-sm font-bold">{appName} — {fill(d.galCounter, open! + 1)}</span>
              <Button onClick={onClose} variant="ghost" size="icon" aria-label={d.galClose}
                className="rounded-full text-white hover:bg-white/20 hover:text-white">
                ✕
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 px-2 pb-4 min-h-0">
              <Button onClick={() => onStep(-1)} variant="ghost" size="icon" aria-label={d.galPrev}
                className="size-11 shrink-0 rounded-full text-white hover:bg-white/20 hover:text-white z-10">
                {rtl ? "›" : "‹"}
              </Button>
              <div className="flex-1 flex items-center justify-center min-h-0 h-full relative">
                {failed ? (
                  <div className="flex flex-col items-center gap-3 text-white/80">
                    <span className="text-sm">{d.galFailed}</span>
                    <Button
                      variant="ghost"
                      onClick={onRetry}
                      className="rounded-full text-white hover:bg-white/20 hover:text-white">
                      {d.galRetry}
                    </Button>
                  </div>
                ) : (
                  <img
                    key={`${current.id}-${retry}`}
                    src={current.url}
                    alt={fill(d.galImgAlt, open! + 1)}
                    loading="eager"
                    decoding="async"
                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                    onError={onImageError}
                  />
                )}
              </div>
              <button onClick={() => onStep(1)} aria-label={d.galNext}
                className="w-11 h-11 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition z-10">
                {rtl ? "‹" : "›"}
              </button>
            </div>
            <div className="flex justify-center gap-2 pb-6">
              {shots.map((sh, i) => (
                <button key={sh.id} onClick={() => onSelect(i)} aria-label={fill(d.galImgAlt, i + 1)}
                  className={`w-2.5 h-2.5 rounded-full transition ${i === open ? "bg-white scale-125" : "bg-white/30 hover:bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X, Download, ShieldCheck, FileDown, Globe, Hash, ChevronDown } from "lucide-react";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { toFaDigits, formatBytes } from "@/lib/fa";
import { getDownloadOptions, type DownloadAppInfo } from "./DownloadActions";
import { Button } from "@/components/ui/button";

// ─── آیکون‌های برند ───
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const AndroidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.6 9.5a5.6 5.6 0 0 0-11.2 0Zm-8-3.9-1.3-2.2a.3.3 0 0 1 .5-.3l1.3 2.2a6.5 6.5 0 0 1 5.8 0l1.3-2.2a.3.3 0 0 1 .5.3l-1.3 2.2A5.6 5.6 0 0 1 17.6 9.5H6.4a5.6 5.6 0 0 1 3.2-3.9ZM9.2 8a.6.6 0 1 0 0-1.1.6.6 0 0 0 0 1.1Zm5.6 0a.6.6 0 1 0 0-1.1.6.6 0 0 0 0 1.1ZM6 10.3h12v8a1.7 1.7 0 0 1-1.7 1.7h-.9v2.4a1.3 1.3 0 0 1-2.6 0V20h-1.6v2.4a1.3 1.3 0 0 1-2.6 0V20h-.9A1.7 1.7 0 0 1 6 18.3Z" />
  </svg>
);

const TuxIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2C8 2 5 5.5 5 10c0 1.5.4 2.9 1 4.1L4 19l2.5-.7c1 .9 2.2 1.7 3.6 2.1l-.6 1.6h5l-.6-1.6c1.4-.4 2.6-1.2 3.6-2.1L20 19l-2-4.9c.6-1.2 1-2.6 1-4.1 0-4.5-3-8-7-8Zm-2.5 5.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5Zm5 0c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5ZM12 13.5c-1.2 0-2.3.5-3 1.4l-.5.6 1.8 1.3c.5-.4 1.1-.6 1.7-.6s1.2.2 1.7.6l1.8-1.3-.5-.6c-.7-.9-1.8-1.4-3-1.4Z" />
  </svg>
);

const WindowsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M3 5.5 10.5 4.4v7.1H3zM11.6 4.2 21 3v8.5h-9.4zM3 12.5h7.5v7.1L3 18.5zM11.6 12.5H21V21l-9.4-1.3z" />
  </svg>
);

function optionIcon(optKey: string, app: DownloadAppInfo, className: string) {
  // آیکون بر اساس مقصد واقعی دانلود
  if (optKey === "github") return <GithubIcon className={className} />;
  if (optKey === "web") return <Globe className={className} aria-hidden="true" />;
  if (optKey === "apk" || app.platform === "android") return <AndroidIcon className={className} />;
  if (app.platform === "linux") return <TuxIcon className={className} />;
  if (app.platform === "windows") return <WindowsIcon className={className} />;
  return <Download className={className} aria-hidden="true" />;
}

type Props = {
  app: DownloadAppInfo;
  appName: string;
  iconUrl: string | null;
  sha256: string | null;
};

// باتم‌شیت دانلود شیشه‌ای — بازسازی کامل
export default function DownloadSheetV2({ app, appName, iconUrl, sha256 }: Props) {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const opts = getDownloadOptions(app);
  const primary = opts.find((o) => o.primary) ?? opts[0];
  const rest = opts.filter((o) => o !== primary);
  const versionName = app.version?.versionName ?? null;
  const fileSize = app.version?.fileSize ?? null;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!opts.length) return null;

  return (
    <>
      {/* دکمه‌ی اصلی — تمیز، بدون شماره نسخه */}
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="w-full"
      >
        {optionIcon(primary?.key ?? "", app, "w-6 h-6")}
        دانلود
      </Button>
      {/* شماره نسخه زیر دکمه */}
      {versionName && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          نسخه‌ی <span dir="ltr" className="font-bold">{versionName}</span>
          {fileSize ? <> · <span dir="ltr">{formatBytes(fileSize)}</span></> : null}
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`دانلود ${appName}`}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 inset-x-0 sm:absolute sm:bottom-auto sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:w-[420px] max-h-[85dvh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] border border-white/10 animate-sheet-up"
            style={{
              background: "color-mix(in srgb, var(--card) 88%, transparent)",
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4 sm:hidden" aria-hidden="true" />
            <Button onClick={() => setOpen(false)} variant="ghost" size="icon-sm" aria-label="بستن"
              className="absolute top-4 left-4 rounded-full">
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>

            <div className="px-6 pb-7 pt-2 sm:pt-6">
              {/* سربرگ */}
              <div className="flex items-center gap-4 mb-5">
                <span className="w-16 h-16 rounded-[22%] grid place-items-center shrink-0 text-white shadow-lg"
                  style={{ background: "var(--primary)" }}>
                  {optionIcon(primary?.key ?? "", app, "w-9 h-9")}
                </span>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-lg leading-7 truncate">{appName}</h2>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-success mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> نسخه‌ی پایدار
                  </span>
                </div>
              </div>

              {/* جزئیات */}
              <div className="rounded-2xl divide-y divide-white/10 mb-5 text-sm border border-white/10"
                style={{ background: "color-mix(in srgb, var(--muted) 60%, transparent)" }}>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-muted-foreground"><FileDown className="w-4 h-4" aria-hidden="true" /> حجم</span>
                  <b dir="ltr">{fileSize ? formatBytes(fileSize) : "—"}</b>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-muted-foreground"><Globe className="w-4 h-4" aria-hidden="true" /> منبع</span>
                  <b>{app.githubRepo ? "گیت‌هاب" : app.sourceType === "fdroid" ? "F-Droid" : "رسمی"}</b>
                </div>
                {sha256 && (
                  <div className="px-4 py-3">
                    <Button variant="ghost" onClick={() => setShowHash(!showHash)} className="w-full justify-between">
                      <span className="inline-flex items-center gap-2 text-muted-foreground"><Hash className="w-4 h-4" aria-hidden="true" /> هش SHA-256</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showHash ? "rotate-180" : ""}`} aria-hidden="true" />
                    </Button>
                    {showHash && <p dir="ltr" className="mt-2 text-[11px] font-mono break-all text-muted-foreground select-all">{sha256}</p>}
                  </div>
                )}
              </div>

              {/* دانلود اصلی */}
              {primary && (
                <a href={primary.href} {...(primary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2.5 w-full bg-primary text-primary-foreground font-extrabold text-base rounded-2xl py-4 mb-2 transition active:scale-[0.98] shadow-lg"
                  style={{ boxShadow: "0 8px 24px -8px var(--primary)" }}>
                  {optionIcon(primary?.key ?? "", app, "w-6 h-6")}
                  دانلود
                </a>
              )}

              {/* بقیه — کشویی */}
              {rest.length > 0 && (
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setShowMore(!showMore)}
                    className="w-full">
                    {showMore ? "بستن گزینه‌ها" : `گزینه‌های بیشتر (${toFaDigits(rest.length)})`}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? "rotate-180" : ""}`} aria-hidden="true" />
                  </Button>
                  <div className={`grid transition-all duration-300 ${showMore ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="space-y-2 pt-1">
                        {rest.map((o) => (
                          <Button asChild key={o.key} variant="ghost" className="h-auto w-full justify-start py-3">
                            <a href={o.href} {...(o.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              onClick={() => setOpen(false)}>
                              <span className="text-primary shrink-0">{o.icon}</span>
                              <span className="flex-1 min-w-0">
                                <span className="block font-bold text-sm truncate">{o.label}</span>
                                {o.sub && <span className="block text-xs text-muted-foreground mt-0.5 truncate">{o.sub}</span>}
                              </span>
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground text-center mt-4 leading-5">
                فایل از منبع رسمی دانلود می‌شود
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

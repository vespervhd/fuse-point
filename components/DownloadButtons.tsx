"use client";

import { Download } from "lucide-react";
import { getDownloadOptions, type DownloadAppInfo } from "./DownloadActions";

// ─── آیکون‌های پلتفرم (اینلاین، بدون وابستگی) ───
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

export function platformIcon(platform: string, className: string) {
  if (platform === "linux") return <TuxIcon className={className} />;
  if (platform === "windows") return <WindowsIcon className={className} />;
  return <AndroidIcon className={className} />;
}

const platformFa: Record<string, string> = {
  android: "اندروید",
  windows: "ویندوز",
  linux: "لینوکس",
};

type PillProps = {
  href: string;
  external?: boolean;
  downloadable?: boolean;
  icon: React.ReactNode;
  label: string;
  text: string;
};

// دکمه‌ی اصلی — تنها عنصر توپر صفحه (جهت «ج»): سبز توپر، تمام‌عرض، شعاع کم
function PrimaryPill({ href, external, downloadable, icon, label, text, versionName }: PillProps & { versionName?: string | null }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={downloadable ? "" : undefined}
      title={label}
      aria-label={label}
      className="flex items-center justify-center gap-2 w-full bg-primary text-primary-content rounded-lg py-3 px-4 text-[15px] font-extrabold"
    >
      <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
      {text}
      {versionName && (
        <span className="font-mono text-[11px] font-medium opacity-80" dir="ltr">v{versionName}</span>
      )}
      <Download className="w-5 h-5" aria-hidden="true" />
    </a>
  );
}

// گزینه‌های فرعی — قرص خطی موبرگی
function GhostPill({ href, external, downloadable, icon, label, text }: PillProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={downloadable ? "" : undefined}
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-1.5 border border-border rounded-lg px-3.5 py-1.5 text-[12.5px] font-bold text-fg/85 hover:border-primary hover:text-primary transition-colors"
    >
      <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      {text}
    </a>
  );
}

// لیبل تمیز بدون نسخه برای گزینه‌های فرعی
const CLEAN_LABEL: Record<string, string> = {
  github: "گیت‌هاب",
  web: "سایت رسمی",
  apk: "APK",
  fdroid: "دانلود",
};

// دکمه‌های دانلود — جهت «ج»: اصلیِ سبز توپر تمام‌عرض + فرعی‌های خطی
export default function DownloadButtons({ app }: { app: DownloadAppInfo }) {
  const opts = getDownloadOptions(app);
  if (!opts.length) return null;

  const primary = opts.find((o) => o.primary) ?? opts[0];
  const rest = opts.filter((o) => o !== primary);

  return (
    <section aria-label="دانلود">
      <PrimaryPill
        href={primary.href}
        external={primary.external}
        downloadable={!primary.external}
        icon={platformIcon(app.platform, "")}
        label={`دانلود برای ${platformFa[app.platform] ?? app.platform}`}
        text="دانلود"
        versionName={primary.key === "apk" ? app.version?.versionName : null}
      />
      {rest.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
          {rest.map((o) => (
            <GhostPill
              key={o.key}
              href={o.href}
              external={o.external}
              downloadable={!o.external}
              icon={o.icon}
              label={CLEAN_LABEL[o.key] ?? "دانلود"}
              text={CLEAN_LABEL[o.key] ?? "دانلود"}
            />
          ))}
        </div>
      )}
    </section>
  );
}

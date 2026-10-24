"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  return platformIcon(platform, className ?? "");
}

// رنگ توکنی هر پلتفرم/مقصد (روی Button پیش‌فرض سوار می‌شود)
const BTN_TINT: Record<string, string> = {
  android: "bg-success text-success-foreground hover:bg-success/90",
  windows: "bg-info text-info-foreground hover:bg-info/90",
  linux: "bg-warning text-warning-foreground hover:bg-warning/90",
  web: "bg-accent text-accent-foreground hover:bg-accent/80",
  github: "bg-muted text-foreground hover:bg-muted/80",
};

const platformFa: Record<string, string> = {
  android: "اندروید",
  windows: "ویندوز",
  linux: "لینوکس",
};

type PillProps = {
  href: string;
  external?: boolean;
  downloadable?: boolean;
  tint: string;
  icon: React.ReactNode;
  label: string;
  text: string;
};

// دکمه‌ی دانلود: آیکون پلتفرم + نام + آیکون دانلود
function NeonPill({ href, external, downloadable, tint, icon, label, text }: PillProps) {
  return (
    <Button asChild className={`rounded-full ${tint}`}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        download={downloadable ? "" : undefined}
        title={label}
        aria-label={label}
      >
        <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
        {text}
        <Download className="w-5 h-5" aria-hidden="true" />
      </a>
    </Button>
  );
}

// لیبل تمیز بدون نسخه برای گزینه‌های فرعی
const CLEAN_LABEL: Record<string, string> = {
  github: "گیت‌هاب",
  web: "سایت رسمی",
  apk: "APK",
  fdroid: "دانلود",
};

// دکمه‌های دانلود — قرصی با رنگ هر پلتفرم
export default function DownloadButtons({ app }: { app: DownloadAppInfo }) {
  const opts = getDownloadOptions(app);
  if (!opts.length) return null;

  const primary = opts.find((o) => o.primary) ?? opts[0];
  const rest = opts.filter((o) => o !== primary);

  return (
    <section aria-label="دانلود">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <NeonPill
          href={primary.href}
          external={primary.external}
          downloadable={!primary.external}
          tint={BTN_TINT[app.platform] ?? BTN_TINT.android}
          icon={platformIcon(app.platform, "")}
          label={`دانلود برای ${platformFa[app.platform] ?? app.platform}`}
          text="دانلود"
        />
        {rest.map((o) => (
          <NeonPill
            key={o.key}
            href={o.href}
            external={o.external}
            tint={BTN_TINT[o.key] ?? BTN_TINT.web}
            icon={o.icon}
            label={CLEAN_LABEL[o.key] ?? "دانلود"}
            text={CLEAN_LABEL[o.key] ?? "دانلود"}
          />
        ))}
      </div>
    </section>
  );
}

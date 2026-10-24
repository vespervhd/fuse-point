"use client";

import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { formatBytes } from "@/lib/fa";
import { getDownloadOptions, type DownloadAppInfo } from "./DownloadActions";
import { BTN_TINT, CLEAN_LABEL, NeonPill } from "./DownloadButtons";
import { sparkBurst } from "@/lib/fx/spark";

// ─── آیکون‌های خطی عین طرح مرجع ───
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M10 18.2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 19 7v10l-7 4-7-4V7l7-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="m5.5 7 6.5 4 6.5-4M12 11v10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

const DownloadGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3.5v11m0 0 4.2-4.2M12 14.5l-4.2-4.2M4.5 16.5v3h15v-3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 19 6v5.5c0 4.5-3 7.6-7 9.5-4-1.9-7-5-7-9.5V6l7-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type CardProps = {
  title: string;
  subtitle: string | null;
  iconUrl: string | null;
  versionName: string | null;
  platformLabel: string;
  fileSize: number | null;
  downloadHref: string | null;
  downloadExternal?: boolean;
};

// کارت دانلود — بازتولید عین طرح تأییدشده‌ی مالک، با داده‌ی واقعی و رنگ‌های توکنی تم
export function DownloadCard({
  title, subtitle, iconUrl, versionName, platformLabel, fileSize,
  downloadHref, downloadExternal,
}: CardProps) {
  const versionChip = versionName
    ? /^v/i.test(versionName) ? versionName : `v${versionName}`
    : null;

  return (
    <article className="dl-card" aria-label={`دانلود ${title}`}>
      <div className="dl-topline">
        <div className="dl-brand"><span className="dl-brand-mark" /> FUSE POINT</div>
        <div className="dl-status"><span className="dl-status-dot" /> آماده دانلود</div>
      </div>

      <header className="dl-header">
        <div className="dl-icon" aria-hidden="true">
          {iconUrl ? (
            <PxImg src={px(iconUrl) || iconUrl} alt="" width={82} height={82} />
          ) : (
            <span>{(title || "?").trim().charAt(0)}</span>
          )}
        </div>
        <div className="dl-heading">
          <h1 className="dl-title">{title}</h1>
          {subtitle && <p className="dl-subtitle">{subtitle}</p>}
        </div>
        {versionChip && <span className="dl-version">{versionChip}</span>}
      </header>

      <div className="dl-rule" />
      <p className="dl-section-label">اطلاعات فایل</p>

      <div className="dl-meta">
        <div className="dl-meta-item">
          <span className="dl-meta-icon"><PhoneIcon /></span>
          <span className="dl-meta-copy">
            <span className="dl-meta-label">پلتفرم</span>
            <span className="dl-meta-value">{platformLabel}</span>
          </span>
        </div>
        <div className="dl-meta-item">
          <span className="dl-meta-icon"><BoxIcon /></span>
          <span className="dl-meta-copy">
            <span className="dl-meta-label">حجم فایل</span>
            <span className="dl-meta-value">{formatBytes(fileSize)}</span>
          </span>
        </div>
      </div>

      {downloadHref && (
        <a
          className="dl-download"
          href={downloadHref}
          {...(downloadExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : { download: "" })}
          onClick={(e) => sparkBurst(e.currentTarget)}
        >
          <DownloadGlyph />
          <span>دانلود برنامه</span>
        </a>
      )}
      <p className="dl-footnote">
        <ShieldGlyph />
        فایل را فقط از منبع معتبر دریافت کنید
      </p>
    </article>
  );
}

const PLATFORM_EN: Record<string, string> = {
  android: "Android",
  windows: "Windows",
  linux: "Linux",
};

type SectionProps = {
  app: DownloadAppInfo;
  title: string;
  subtitle: string | null;
  iconUrl: string | null;
};

// بخش دانلود اصلی صفحه‌ی اپ — کارت همیشه بالای صفحه است و دکمه‌اش مستقیم دانلود می‌کند؛
// گزینه‌های فرعی (گیت‌هاب/سایت رسمی) قرص‌های لینک مستقیم زیر کارت می‌مانند
export default function DownloadCardSection({ app, title, subtitle, iconUrl }: SectionProps) {
  const opts = getDownloadOptions(app);
  const primary = opts.find((o) => o.primary) ?? opts[0] ?? null;
  const rest = opts.filter((o) => o !== primary);

  return (
    <section aria-label="دانلود">
      <DownloadCard
        title={title}
        subtitle={subtitle}
        iconUrl={iconUrl}
        versionName={app.version?.versionName ?? null}
        platformLabel={PLATFORM_EN[app.platform] ?? app.platform}
        fileSize={app.version?.fileSize ?? null}
        downloadHref={primary?.href ?? null}
        downloadExternal={primary?.external}
      />
      {rest.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
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
      )}
    </section>
  );
}

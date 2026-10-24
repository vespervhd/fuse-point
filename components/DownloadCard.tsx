"use client";

import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { getDownloadOptions, type DownloadAppInfo } from "./DownloadActions";
import { BTN_TINT, CLEAN_LABEL, NeonPill } from "./DownloadButtons";
import { sparkBurst } from "@/lib/fx/spark";
import { STR, bytesL, platName, type Locale } from "@/lib/i18n";

// ─── آیکون‌های خطی پلتفرم — عین نمونه (اندروید: گوشی، ویندوز: مانیتور، لینوکس: ترمینال) ───
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M10 18.2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.8" y="4" width="18.4" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M9.5 20.5h5M12 16.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.8" y="4" width="18.4" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="m6.5 9 3 3-3 3M12.5 15.5H17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
function PlatformGlyph({ platform }: { platform: string }) {
  if (platform === "windows") return <MonitorIcon />;
  if (platform === "linux") return <TerminalIcon />;
  return <PhoneIcon />;
}

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
  platform: string;
  fileSize: number | null;
  downloadHref: string | null;
  downloadExternal?: boolean;
  locale: Locale;
};

// کارت دانلود — عین طرح تأییدشده‌ی مالک، با داده‌ی واقعی و رنگ‌های توکنی تم
export function DownloadCard({
  title, subtitle, iconUrl, versionName, platform, fileSize,
  downloadHref, downloadExternal, locale,
}: CardProps) {
  const d = STR[locale];
  const versionChip = versionName
    ? /^v/i.test(versionName) ? versionName : `v${versionName}`
    : null;

  return (
    <article className="dl-card" aria-label={`${d.download} ${title}`}>
      <div className="dl-topline">
        <div className="dl-brand"><span className="dl-brand-mark" /> FUSE POINT</div>
        <div className="dl-status"><span className="dl-status-dot" /> {d.ready}</div>
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
      <p className="dl-section-label">{d.fileInfo}</p>

      <div className="dl-meta">
        <div className="dl-meta-item">
          <span className="dl-meta-icon"><PlatformGlyph platform={platform} /></span>
          <span className="dl-meta-copy">
            <span className="dl-meta-label">{d.platform}</span>
            <span className="dl-meta-value">{platName(locale, platform)}</span>
          </span>
        </div>
        <div className="dl-meta-item">
          <span className="dl-meta-icon"><BoxIcon /></span>
          <span className="dl-meta-copy">
            <span className="dl-meta-label">{d.fileSize}</span>
            <span className="dl-meta-value">{bytesL(fileSize, locale)}</span>
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
          <span>{d.download}</span>
        </a>
      )}
      <p className="dl-footnote">
        <ShieldGlyph />
        {d.footnote}
      </p>
    </article>
  );
}

const PILL_LABEL_EN: Record<string, string> = {
  github: "GitHub",
  web: "Official site",
  apk: "APK",
  fdroid: "Download",
};

type SectionProps = {
  app: DownloadAppInfo;
  title: string;
  subtitle: string | null;
  iconUrl: string | null;
  locale: Locale;
};

// بخش دانلود اصلی صفحه‌ی اپ — کارت همیشه بالای صفحه است و دکمه‌اش مستقیم دانلود می‌کند؛
// گزینه‌های فرعی (وب‌سایت رسمی/گیت‌هاب طبق قانون منبع هوشمند) قرص‌های لینک زیر کارت می‌مانند
export default function DownloadCardSection({ app, title, subtitle, iconUrl, locale }: SectionProps) {
  const opts = getDownloadOptions(app);
  const primary = opts.find((o) => o.primary) ?? opts[0] ?? null;
  const rest = opts.filter((o) => o !== primary);
  const pillLabel = (key: string) =>
    locale === "en" ? PILL_LABEL_EN[key] ?? "Download" : CLEAN_LABEL[key] ?? "دانلود";

  return (
    <section aria-label={STR[locale].download}>
      <DownloadCard
        title={title}
        subtitle={subtitle}
        iconUrl={iconUrl}
        versionName={app.version?.versionName ?? null}
        platform={app.platform}
        fileSize={app.version?.fileSize ?? null}
        downloadHref={primary?.href ?? null}
        downloadExternal={primary?.external}
        locale={locale}
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
              label={pillLabel(o.key)}
              text={pillLabel(o.key)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

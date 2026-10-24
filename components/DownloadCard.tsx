"use client";

import { Globe } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import BidiText from "@/components/BidiText";
import { px } from "@/lib/img";
import { getDownloadOptions, type DownloadAppInfo } from "./DownloadActions";
import { sparkBurst } from "@/lib/fx/spark";
import { STR, bytesL, platName, type Locale } from "@/lib/i18n";

// ─── آیکون‌های خطی — هم‌خانواده‌ی نمونه‌ی دوم کادر دانلود ───
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

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 3.5h7l4.5 4.5v12.5a1 1 0 0 1-1 1h-10.5a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M14 3.5v4.5h4.5M9.5 13h5M9.5 16.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const DownloadGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const HistoryGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.5 12a8.5 8.5 0 1 1 2.5 6.1M3.6 12H7m-3.4 0L5 8.8M12 7.8V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// برچسب فرمت از روی نوع فایل؛ برای نسخه‌ی external پسوند لینک را می‌خواند
function formatLabel(fileType: string | null | undefined, fileUrl: string | null | undefined): string {
  if (fileType && fileType !== "external") return fileType.toUpperCase();
  if (fileUrl) {
    try {
      const m = new URL(fileUrl).pathname.match(/\.([a-z0-9]{2,8})$/i);
      if (m) return m[1].toUpperCase();
    } catch {}
  }
  return "—";
}

// لینک هوشمند منبع — همان قانون مالک: وب‌سایت رسمی اول، وگرنه گیت‌هاب
function smartSource(app: DownloadAppInfo): { href: string; github: boolean } | null {
  const isGh = (u: string) => {
    try { return /(^|\.)github\.com$/i.test(new URL(u).hostname); } catch { return false; }
  };
  if (app.sourceUrl && app.sourceType !== "fdroid" && !isGh(app.sourceUrl)) {
    return { href: app.sourceUrl, github: false };
  }
  if (app.githubRepo) return { href: `https://github.com/${app.githubRepo}`, github: true };
  if (app.sourceUrl) {
    if (isGh(app.sourceUrl)) {
      const m = app.sourceUrl.match(/github\.com\/([^/#?]+(?:\/[^/#?]+)?)/);
      if (m) return { href: `https://github.com/${m[1]}`, github: true };
    }
    return { href: app.sourceUrl, github: false };
  }
  return null;
}

type CardProps = {
  title: string;
  subtitle: string | null;
  iconUrl: string | null;
  versionName: string | null;
  platform: string;
  fileSize: number | null;
  fileType: string | null;
  fileUrl: string | null | undefined;
  downloadHref: string | null;
  downloadExternal?: boolean;
  pendingBadge?: string | null;
  source: { href: string; github: boolean } | null;
  hasOlderVersions: boolean;
  locale: Locale;
};

// کارت دانلود — عین نمونه‌ی دوم کادر دانلود، با داده‌ی واقعی و رنگ‌های توکنی تم؛
// تنها تغییرِ دستوری مالک: فلشِ روی دکمه‌ی دانلود حذف شده، فقط آیکون دانلود مانده
export function DownloadCard({
  title, subtitle, iconUrl, versionName, platform, fileSize, fileType, fileUrl,
  downloadHref, downloadExternal, pendingBadge, source, hasOlderVersions, locale,
}: CardProps) {
  const d = STR[locale];
  const versionChip = versionName
    ? /^v/i.test(versionName) ? versionName : `v${versionName}`
    : null;
  const format = formatLabel(fileType, fileUrl);
  const btnSub = d.dlBtnSub
    .replace("{platform}", platName(locale, platform))
    .replace("{format}", format);

  const openVersions = (e: React.MouseEvent) => {
    const sec = document.getElementById("versions");
    const dt = sec?.querySelector("details");
    if (dt) {
      e.preventDefault();
      dt.open = true;
      sec?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section aria-label={`${d.download} ${title}`}>
      <article className="dl2-card">
        <div className="dl2-identity">
          <div className="dl2-icon" aria-hidden="true">
            <AppIcon src={iconUrl ? px(iconUrl, "icon") || iconUrl : null} name={title} width={100} height={100} />
          </div>
          <h1 className="dl2-title">{title}</h1>
          {subtitle && <p className="dl2-subtitle"><BidiText text={subtitle} /></p>}
          <div className="dl2-badges">
            {versionChip && (
              <span className="dl2-version"><i />{versionChip}</span>
            )}
            {pendingBadge && <span className="dl2-pending">{pendingBadge}</span>}
          </div>
        </div>

        <p className="dl2-section-label">{d.dlAppInfo}</p>

        <div className="dl2-meta">
          <div className="dl2-meta-item">
            <span className="dl2-meta-label">{d.platform}</span>
            <span className="dl2-meta-value">{platName(locale, platform)}</span>
          </div>
          <div className="dl2-meta-item">
            <span className="dl2-meta-label">{d.fileSize}</span>
            <span className="dl2-meta-value">{bytesL(fileSize, locale)}</span>
          </div>
          <div className="dl2-meta-item">
            <span className="dl2-meta-label">{d.dlFormat}</span>
            <span className="dl2-meta-value" dir="ltr">{format}</span>
          </div>
        </div>

        <div className="dl2-area">
          {downloadHref && (
            <a
              className="dl2-download"
              href={downloadHref}
              {...(downloadExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : { download: "" })}
              onClick={(e) => sparkBurst(e.currentTarget)}
              aria-label={`${d.dlBtnTitle} ${title}`}
            >
              <DownloadGlyph />
              <span className="dl2-btn-text">
                <span className="dl2-btn-title">{d.dlBtnTitle}</span>
                <span className="dl2-btn-sub">{btnSub}</span>
              </span>
            </a>
          )}

          {(source || hasOlderVersions) && (
            <div className="dl2-links">
              {source && (
                <a
                  className="dl2-secondary"
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.github
                    ? <GithubIcon className="dl2-secondary-icon" />
                    : <Globe className="dl2-secondary-icon" aria-hidden="true" />}
                  {d.dlSource}
                </a>
              )}
              {hasOlderVersions && (
                <a className="dl2-secondary" href="#versions" onClick={openVersions}>
                  <HistoryGlyph />
                  {d.dlVersions}
                </a>
              )}
            </div>
          )}

          <p className="dl2-note">
            <ShieldGlyph />
            <span>{d.dlNote}</span>
          </p>
        </div>
      </article>

      <div className="dl2-trust">
        <div className="dl2-trust-heading">
          <span className="dl2-trust-icon" aria-hidden="true"><ShieldGlyph /></span>
          <h2>{d.dlTrustTitle}</h2>
        </div>
        <p>{d.dlTrustDesc}</p>
        <div className="dl2-trust-points">
          <span><b>✓</b> {d.dlTrustP1}</span>
          <span><b>✓</b> {d.dlTrustP2}</span>
          <span><b>✓</b> {d.dlTrustP3}</span>
        </div>
      </div>
    </section>
  );
}

type SectionProps = {
  app: DownloadAppInfo;
  title: string;
  subtitle: string | null;
  iconUrl: string | null;
  hasOlderVersions: boolean;
  locale: Locale;
};

// بخش دانلود اصلی صفحه‌ی اپ — کارت همیشه بالای صفحه است و دکمه‌اش از مسیر
// ترکینگ داخلی می‌گذرد؛ لینک ثانویه طبق قانون منبع هوشمند است و «نسخه‌های دیگر»
// کشوی نسخه‌های قبلیِ همان صفحه را باز می‌کند (نه لینک خارجی ریلیزها)
export default function DownloadCardSection({ app, title, subtitle, iconUrl, hasOlderVersions, locale }: SectionProps) {
  const opts = getDownloadOptions(app);
  const primary = opts.find((o) => o.primary) ?? opts[0] ?? null;
  const v = app.version;

  return (
    <DownloadCard
      title={title}
      subtitle={subtitle}
      iconUrl={iconUrl}
      versionName={v?.versionName ?? null}
      platform={app.platform}
      fileSize={v?.fileSize ?? null}
      fileType={v?.fileType ?? null}
      fileUrl={v?.fileUrl}
      downloadHref={primary?.href ?? null}
      downloadExternal={primary?.external}
      pendingBadge={app.pending ? STR[locale].pendingReview : null}
      source={smartSource(app)}
      hasOlderVersions={hasOlderVersions}
      locale={locale}
    />
  );
}

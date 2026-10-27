"use client";

import { Globe } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import BidiText from "@/components/BidiText";
import FavoriteButton from "@/components/FavoriteButton";
import { px } from "@/lib/img";
import { getDownloadOptions, type DownloadAppInfo } from "./DownloadActions";
import { STR, bytesL, platName, type Locale } from "@/lib/i18n";

const DownloadGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5 shrink-0">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4 shrink-0">
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
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4 shrink-0">
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
  appId: string | null;
  title: string;
  subtitle: string | null;
  subtitleNote?: string | null;
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
  // کپسول دنبال‌کردن از صفحه (بیرون از کش) به‌صورت prop می‌آید تا
  // پایینِ کارت رندر شود؛ خود کپسول کلاینت است و وضعیت کاربر را فقط از
  // مرورگر می‌خواند، پس چیزی از نشست در کش نمی‌رود
  capsules?: React.ReactNode;
};

// کارت دانلود — چیدمان نمونه‌ی تأییدشده‌ی فروشگاهی: آیکون + نام + توضیح،
// چیپ‌های اصلی فقط پلتفرم/حجم/ورژن، ردیف دانلود + قلب علاقه‌مندی، لینک‌های
// ثانویه (منبع رسمی، نسخه‌های دیگر) و یادداشت امنیتی. فرمت فایل در زیرنویس
// دکمه‌ی دانلود می‌ماند، پس هیچ اطلاعاتی از دست نمی‌رود.
export function DownloadCard({
  appId, title, subtitle, subtitleNote, iconUrl, versionName, platform, fileSize, fileType, fileUrl,
  downloadHref, downloadExternal, pendingBadge, source, hasOlderVersions, locale, capsules,
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
      <article className="rounded-[20px] border border-border bg-card p-5">
        <div className="flex items-start gap-3.5">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted" aria-hidden="true">
            <AppIcon
              src={iconUrl ? px(iconUrl, "icon") || iconUrl : null}
              name={title}
              width={64}
              height={64}
              imgClassName="size-16 object-cover"
              letterClassName="text-2xl font-extrabold"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[17px] font-extrabold leading-7">{title}</h1>
            {subtitle && <p className="mt-0.5 text-[13.5px] leading-6 text-muted-foreground"><BidiText text={subtitle} /></p>}
            {subtitleNote && <p className="mt-0.5 text-xs text-muted-foreground">{subtitleNote}</p>}
          </div>
        </div>

        {pendingBadge && (
          <p className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-xs font-bold">{pendingBadge}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs font-bold">{platName(locale, platform)}</span>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-bold">{bytesL(fileSize, locale)}</span>
          {versionChip && <span className="rounded-full border border-border px-3 py-1 text-xs font-bold" dir="ltr">{versionChip}</span>}
        </div>

        <div className="mt-4 flex items-stretch gap-2.5">
          {downloadHref && (
            <a
              className="motion-press flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-primary-foreground"
              href={downloadHref}
              {...(downloadExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : { download: "" })}
              aria-label={`${d.dlBtnTitle} ${title}`}
            >
              <DownloadGlyph />
              <span className="text-center">
                <span className="block text-[15.5px] font-extrabold leading-6">{d.dlBtnTitle}</span>
                <span className="block text-xs font-bold opacity-80">{btnSub}</span>
              </span>
            </a>
          )}
          {appId && <FavoriteButton appId={appId} appName={title} />}
        </div>

        {(source || hasOlderVersions) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {source && (
              <a
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border px-3.5 text-[13px] font-bold text-muted-foreground hover:text-foreground"
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.github
                  ? <GithubIcon className="size-4 shrink-0" />
                  : <Globe className="size-4 shrink-0" aria-hidden="true" />}
                {d.dlSource}
              </a>
            )}
            {hasOlderVersions && (
              <a
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border px-3.5 text-[13px] font-bold text-muted-foreground hover:text-foreground"
                href="#versions"
                onClick={openVersions}
              >
                <HistoryGlyph />
                {d.dlVersions}
              </a>
            )}
          </div>
        )}

        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <ShieldGlyph />
          <span>{d.dlNote}</span>
        </p>

        {capsules && <div className="mt-4">{capsules}</div>}
      </article>
    </section>
  );
}

type SectionProps = {
  appId: string;
  app: DownloadAppInfo;
  title: string;
  subtitle: string | null;
  subtitleNote?: string | null;
  iconUrl: string | null;
  hasOlderVersions: boolean;
  locale: Locale;
  capsules?: React.ReactNode;
};

// بخش دانلود اصلی صفحه‌ی اپ — کارت همیشه بالای صفحه است و دکمه‌اش از مسیر
// ترکینگ داخلی می‌گذرد؛ لینک ثانویه طبق قانون منبع هوشمند است و «نسخه‌های دیگر»
// کشوی نسخه‌های قبلیِ همان صفحه را باز می‌کند (نه لینک خارجی ریلیزها)
export default function DownloadCardSection({ appId, app, title, subtitle, subtitleNote, iconUrl, hasOlderVersions, locale, capsules }: SectionProps) {
  const opts = getDownloadOptions(app);
  const primary = opts.find((o) => o.primary) ?? opts[0] ?? null;
  const v = app.version;

  return (
    <DownloadCard
      appId={appId}
      title={title}
      subtitle={subtitle}
      subtitleNote={subtitleNote}
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
      capsules={capsules}
    />
  );
}

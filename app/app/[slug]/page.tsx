import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/store";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { androidVersion } from "@/lib/fa";
import VersionsDrawer from "@/components/VersionsDrawer";
import DownloadCardSection from "@/components/DownloadCard";
import AppDetailsDrawer from "@/components/AppDetailsDrawer";
import Gallery from "@/components/Gallery";
import Capsules from "@/components/Capsules";
import SimilarCard from "@/components/SimilarCard";
import { SectionHead } from "@/components/Bits";
import Alternatives from "@/components/Alternatives";
import { findAlternatives } from "@/data/alternatives";
import { RefreshCw } from "lucide-react";
import { siteUrl } from "@/lib/site-url";
import { px } from "@/lib/img";
import { getLocale } from "@/lib/i18n-server";
import { STR, appName, appShort, appDesc, dateL, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  const locale = await getLocale();
  if (!app) return { title: locale === "fa" ? "یافت نشد" : "Not found" };
  const platFa = app.platform === "android" ? "اندروید" : app.platform === "windows" ? "ویندوز" : "لینوکس";
  const platEn = app.platform === "android" ? "Android" : app.platform === "windows" ? "Windows" : "Linux";
  const title = locale === "fa"
    ? `دانلود ${app.nameFa} برای ${platFa}`
    : `Download ${app.nameEn || app.nameFa} for ${platEn}`;
  const desc = locale === "fa"
    ? app.shortDescFa || app.shortDesc || `دانلود ${app.nameFa} برای ${platFa} با لینک مستقیم و بررسی امنیتی`
    : app.shortDesc || app.shortDescFa || `Download ${app.nameEn || app.nameFa} for ${platEn} — direct link, security-checked`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/app/${app.slug}` },
    openGraph: {
      title,
      description: desc,
      images: app.iconUrl && px(app.iconUrl) ? [siteUrl() + px(app.iconUrl)!] : undefined,
    },
  };
}

// پاک‌سازی نشانه‌های مارک‌داون از توضیحات (دیتای دیتابیس دست‌نخورده می‌ماند)
function stripMd(t: string | null | undefined): string {
  if (!t) return "";
  return t
    .replace(/(\*\*|__)([\s\S]*?)\1/g, "$2")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "");
}

// منبع رسمی طبق قانون مالک: وب‌سایت رسمی اول، وگرنه گیت‌هاب؛ F-Droid فقط وقتی هیچ‌کدام نیست
function officialSource(app: {
  sourceUrl: string | null; sourceType: string; githubRepo: string | null;
}, locale: Locale): { href: string | null; label: string } {
  const isGh = (u: string) => /(^|\.)github\.com$/i.test(new URL(u).hostname);
  const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
  if (app.sourceUrl && app.sourceType !== "fdroid") {
    try {
      if (!isGh(app.sourceUrl)) return { href: app.sourceUrl, label: host(app.sourceUrl) };
    } catch {}
  }
  if (app.githubRepo) return { href: `https://github.com/${app.githubRepo}`, label: "github.com" };
  if (app.sourceUrl) {
    return app.sourceType === "fdroid"
      ? { href: app.sourceUrl, label: "F-Droid" }
      : { href: app.sourceUrl, label: host(app.sourceUrl) };
  }
  return { href: null, label: locale === "fa" ? "—" : "—" };
}

export default async function AppPage({ params }: Props) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) notFound();
  const locale = await getLocale();
  const d = STR[locale];
  const v = app.current;

  // بررسی آپدیت: آیا کاربر لاگین‌کرده این برنامه را دانلود کرده و نسخه جدید آمده؟
  let hasUpdate = false;
  let downloadedVersion: string | null = null;
  try {
    const user = await getSessionUser();
    if (user && v && app.platform === "android") {
      const dls = await db.select({ versionId: s.downloadEvents.versionId })
        .from(s.downloadEvents)
        .where(and(eq(s.downloadEvents.userId, user.id), eq(s.downloadEvents.appId, app.id)))
        .orderBy(desc(s.downloadEvents.createdAt)).limit(1);
      if (dls.length && dls[0].versionId && dls[0].versionId !== v.id) {
        hasUpdate = true;
        const dv = await db.select({ versionName: s.appVersions.versionName })
          .from(s.appVersions).where(eq(s.appVersions.id, dls[0].versionId!)).limit(1);
        downloadedVersion = dv[0]?.versionName ?? null;
      }
    }
  } catch {}

  // جایگزین‌های آزاد: اگر برای این برنامه نگاشت داریم، اپ‌های جایگزین را از DB پیدا کن
  const altEntry = findAlternatives(app.nameEn);
  let altApps: { nameEn: string; why: string; slug: string; nameFa: string; iconUrl: string | null }[] = [];
  if (altEntry) {
    try {
      const names = altEntry.alternatives.map((a) => a.nameEn);
      const rows = await db.select({
        nameEn: s.apps.nameEn, slug: s.apps.slug, nameFa: s.apps.nameFa, iconUrl: s.apps.iconUrl,
      })
        .from(s.apps)
        .where(and(s.apps.isPublished, sql`lower(${s.apps.nameEn}) = ANY(${names.map((n) => n.toLowerCase())})`));
      const byName = new Map(rows.map((r) => [r.nameEn.toLowerCase(), r]));
      altApps = altEntry.alternatives
        .map((a) => {
          const hit = byName.get(a.nameEn.toLowerCase());
          return hit ? { ...a, slug: hit.slug, nameFa: hit.nameFa, iconUrl: hit.iconUrl } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
    } catch {}
  }

  const src = officialSource(app, locale);
  const aboutText = appDesc(app, locale);
  const developerHref = app.developerName
    ? `/developer/${encodeURIComponent(app.developerName)}`
    : null;
  const versionsSource = app.githubRepo
    ? "github.com"
    : app.sourceUrl
      ? (() => { try { return new URL(app.sourceUrl).hostname.replace(/^www\./, ""); } catch { return app.sourceUrl; } })()
      : null;

  return (
    <div className="animate-fade-up">
      {/* ۱) کارت دانلود — بلوک اصلی بالای صفحه؛ مشخصات اصلی فقط پلتفرم/حجم/نسخه داخل خود کارت */}
      <DownloadCardSection
        app={{
          platform: app.platform,
          githubRepo: app.githubRepo,
          githubStars: app.githubStars,
          sourceUrl: app.sourceUrl,
          sourceType: app.sourceType,
          version: v
            ? {
                id: v.id,
                versionName: v.versionName,
                fileSize: v.fileSize,
                fileType: v.fileType,
                fileUrl: v.fileUrl,
              }
            : null,
        }}
        title={appName(app, locale)}
        subtitle={appShort(app, locale) || app.categories[0]?.nameFa || null}
        iconUrl={app.iconUrl}
        locale={locale}
      />

      {/* ۲) کپسول‌های دنبال‌کردن و نشان — زیر هدر کارت، بالای خط اطلاعات فایل */}
      <Capsules appId={app.id} slug={app.slug} locale={locale} />

      {/* بنر آپدیت برای کاربری که نسخه‌ی قدیمی‌تر را دانلود کرده */}
      {hasUpdate && v && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-success px-4 py-3 text-success-foreground shadow-sm" role="status">
          <RefreshCw className="w-5 h-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">
            <b>{d.updateAvailable}</b>{" "}
            <span className="opacity-80">
              {downloadedVersion ? (
                <>{d.updateFromTo.replace("{from}", downloadedVersion).replace("{to}", v.versionName ?? "")}</>
              ) : (
                <>{d.updateReleased.replace("{v}", v.versionName ?? "")}</>
              )}
            </span>
          </p>
        </div>
      )}

      {/* ۳) پیش‌نمایش — اسکرین‌شات‌های واقعی + لایت‌باکس */}
      {app.screenshots.length > 0 && (
        <section className="mt-9" aria-label={d.preview}>
          <SectionHead title={d.preview} locale={locale} />
          <Gallery
            appName={appName(app, locale)}
            locale={locale}
            shots={app.screenshots.map((sh) => ({ id: sh.id, url: px(sh.url) || sh.url }))}
          />
        </section>
      )}

      {/* ۴) درباره */}
      {aboutText && (
        <section className="mt-9" aria-label={d.about}>
          <SectionHead title={d.about} locale={locale} />
          <p className="text-[15px] leading-8 whitespace-pre-line text-foreground/90">{stripMd(aboutText)}</p>
        </section>
      )}

      {/* ۵) مشخصات کامل — یک کشوی جمع‌وجور برای همه‌ی متای فرعی */}
      <section className="mt-9" aria-label={d.fullDetails}>
        <AppDetailsDrawer
          developer={app.developerName || (locale === "fa" ? "نامشخص" : "Unknown")}
          license={app.license || null}
          updatedLabel={v ? dateL(v.publishedAt || v.createdAt, locale) : "—"}
          sourceHref={src.href}
          sourceLabel={src.label}
          minAndroidLabel={app.platform === "android" ? androidVersion(v?.minSdk) : null}
          verifiedLabel={v?.verifiedAt ? dateL(v.verifiedAt, locale) : null}
          sha256={v?.sha256 ?? null}
          permissions={app.permissions.map((p) => p.permission)}
          appId={app.id}
          appName={appName(app, locale)}
          developerHref={developerHref}
          locale={locale}
        />
      </section>

      {/* ۶) نسخه‌های قبلی */}
      {app.versions.length > 1 && (
        <section className="mt-4" aria-label={d.versions}>
          <VersionsDrawer versions={app.versions} currentId={v?.id ?? null} locale={locale} sourceLabel={versionsSource} />
        </section>
      )}

      {/* ۷) برنامه‌های مشابه — کارت‌های فشرده */}
      {app.similar.length > 0 && (
        <section className="mt-10" aria-label={d.similar}>
          <SectionHead title={d.similar} locale={locale} />
          <div className="flex flex-col gap-[9px]">
            {app.similar.slice(0, 6).map((a) => (
              <SimilarCard key={a.id} app={a} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* جایگزین‌های آزاد (ویژگی موجود تولید) */}
      {altEntry && altApps.length > 0 && (
        <section className="mt-10">
          <Alternatives entry={altEntry} apps={altApps} locale={locale} />
        </section>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← {d.backHome}</Link>
      </div>
    </div>
  );
}

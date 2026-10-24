// بدنه‌ی عمومی صفحه‌ی اپ با کشِ رندر (Next 16 «use cache»)
// بیرون می‌ماند (داینامیک، در پوسته‌ی صفحه): کپسول‌های علاقه‌مندی/دنبال‌کردن و بنر
// آپدیت — هر دو به نشستِ کاربر وابسته‌اند و هرگز نباید کش شوند. بقیه‌ی بدنه (کارت
// دانلود، گالری، درباره، مشخصات، نسخه‌ها، مشابه‌ها) عمومی است و با revalidate ۳۶۰۰
// ثانیه کش می‌شود؛ کلیدِ کش از روی slug و زبان ساخته می‌شود.
import { cacheLife } from "next/cache";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { and, sql } from "drizzle-orm";
import { androidVersion } from "@/lib/fa";
import VersionsDrawer from "@/components/VersionsDrawer";
import DownloadCardSection from "@/components/DownloadCard";
import AppDetailsDrawer from "@/components/AppDetailsDrawer";
import Gallery from "@/components/Gallery";
import SimilarCard from "@/components/SimilarCard";
import { SectionHead } from "@/components/Bits";
import Alternatives from "@/components/Alternatives";
import { findAlternatives } from "@/data/alternatives";
import { px } from "@/lib/img";
import { getAppBySlugCore, type Platform } from "@/lib/store";
import { STR, appName, appShort, appDesc, catName, dateL, type Locale } from "@/lib/i18n";

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

// ۱) کارت دانلود — بالای کپسول‌ها قرار می‌گیرد
export async function AppTop({ slug, locale }: { slug: string; locale: Locale }) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  const app = await getAppBySlugCore(slug);
  if (!app) return null;
  const v = app.current;
  // فالبک دانلود: فقط وقتی هیچ نسخه‌ی فعالی نیست و نسخه‌ی در انتظار بازبینی
  // فایل مستقیم دارد، همان نسخه برای کارت دانلود استفاده می‌شود (با برچسب).
  const pv = !v && app.pendingVersion && app.pendingVersion.fileUrl && app.pendingVersion.fileType !== "external"
    ? app.pendingVersion
    : null;
  const shown = v ?? pv;
  return (
    <DownloadCardSection
      app={{
        platform: app.platform,
        githubRepo: app.githubRepo,
        githubStars: app.githubStars,
        sourceUrl: app.sourceUrl,
        sourceType: app.sourceType,
        pending: !!pv,
        version: shown
          ? {
              id: shown.id,
              versionName: shown.versionName,
              fileSize: shown.fileSize,
              fileType: shown.fileType,
              fileUrl: shown.fileUrl,
            }
          : null,
      }}
      title={appName(app, locale)}
      subtitle={appShort(app, locale) || (app.categories[0] ? catName(app.categories[0], locale) : null)}
      iconUrl={app.iconUrl}
      hasOlderVersions={app.versions.length > 1}
      locale={locale}
    />
  );
}

// ۲) بقیه‌ی بدنه — زیر بنر آپدیت قرار می‌گیرد
export async function AppRest({ slug, locale }: { slug: string; locale: Locale }) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  const d = STR[locale];
  const app = await getAppBySlugCore(slug);
  if (!app) return null;
  const v = app.current;
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

  return (
    <>
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

      {/* ۶) نسخه‌های قبلی — لنگر #versions برای دکمه‌ی «نسخه‌های دیگر» کارت دانلود */}
      {app.versions.length > 1 && (
        <section className="mt-4" id="versions" aria-label={d.versions}>
          <VersionsDrawer versions={app.versions} currentId={v?.id ?? null} locale={locale} sourceLabel={versionsSource} totalOlder={app.versionsTotal - (v ? 1 : 0)} />
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
    </>
  );
}

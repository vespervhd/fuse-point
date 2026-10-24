import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/store";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { formatDate, androidVersion } from "@/lib/fa";
import AppCard from "@/components/AppCard";
import FavoriteButton from "@/components/FavoriteButton";
import FollowButton from "@/components/FollowButton";
import ShareButton from "@/components/ShareButton";
import VersionsDrawer from "@/components/VersionsDrawer";
import DownloadCardSection from "@/components/DownloadCard";
import AppDetailsDrawer from "@/components/AppDetailsDrawer";
import Gallery from "@/components/Gallery";
import { computeTags } from "@/lib/tags";
import { px } from "@/lib/img";
import DbIcon from "@/components/DbIcon";
import ReportButton from "@/components/ReportButton";
import Alternatives from "@/components/Alternatives";
import { findAlternatives } from "@/data/alternatives";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { siteUrl } from "@/lib/site-url";


type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return { title: "یافت نشد" };
  const platFa = app.platform === "android" ? "اندروید" : app.platform === "windows" ? "ویندوز" : "لینوکس";
  const desc = app.shortDescFa || app.shortDesc || `دانلود ${app.nameFa} برای ${platFa} با لینک مستقیم و بررسی امنیتی`;
  return {
    title: `دانلود ${app.nameFa} برای ${platFa}`,
    description: desc,
    alternates: { canonical: `/app/${app.slug}` },
    openGraph: {
      title: `دانلود ${app.nameFa} برای ${platFa}`,
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

export default async function AppPage({ params }: Props) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) notFound();
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

  const tags = computeTags({
    permissions: app.permissions.map((p: any) => p.permission),
    isOpenSource: app.isOpenSource,
    fileSize: v?.fileSize ?? null,
  });

  // جایگزین‌های آزاد: اگر برای این برنامه نگاشت داریم، اپ‌های جایگزین را از DB پیدا کن
  let altEntry = findAlternatives(app.nameEn);
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
    <div className="animate-fade-up max-w-3xl mx-auto">
      {/* کارت دانلود — بلوک اصلی بالای صفحه (عین طرح تأییدشده)؛ مشخصات اصلی داخل خود کارت است */}
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
        title={app.nameEn || app.nameFa}
        subtitle={app.shortDescFa || app.categories[0]?.nameFa || app.shortDesc || null}
        iconUrl={app.iconUrl}
      />

      {/* اکشن‌ها */}
      <div className="flex flex-row gap-2 mt-4">
        <FavoriteButton appId={app.id} appName={app.slug} />
        <FollowButton appId={app.id} />
        <ShareButton appName={app.nameFa} slug={app.slug} />
      </div>

      {/* بنر آپدیت */}
      {hasUpdate && v && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-success px-4 py-3 text-success-foreground shadow-sm" role="status">
          <RefreshCw className="w-5 h-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">
            <b>نسخه‌ی جدید موجوده!</b>{" "}
            <span className="opacity-80">
              {downloadedVersion ? (
                <>از <span dir="ltr">{downloadedVersion}</span> به <span dir="ltr">{v.versionName}</span></>
              ) : (
                <>نسخه‌ی <span dir="ltr">{v.versionName}</span> منتشر شده</>
              )}
            </span>
          </p>
        </div>
      )}

      {/* تصاویر */}
      {app.screenshots.length > 0 && (
        <section className="py-6" aria-label="تصاویر محیط برنامه">
          <h2 className="font-extrabold text-[17px] px-1 mb-3">پیش‌نمایش</h2>
          <Gallery
            appName={app.nameFa}
            shots={app.screenshots.map((sh) => ({ id: sh.id, url: px(sh.url) || sh.url }))}
          />
        </section>
      )}

      {/* معرفی */}
      {(app.descriptionFa || app.description) && (
        <>
          <div className="h-px bg-border" />
          <section className="py-6" aria-label="معرفی">
            <h2 className="font-extrabold text-[17px] px-1 mb-3">درباره‌ی این برنامه</h2>
            <p className="text-[15px] leading-8 px-1 whitespace-pre-line text-foreground/90">{stripMd(app.descriptionFa || app.description)}</p>
          </section>
        </>
      )}

      {/* نسخه‌های قبلی */}
      {app.versions.length > 1 && (
        <>
          <div className="h-px bg-border" />
          <div className="py-4">
            <VersionsDrawer versions={app.versions} />
          </div>
        </>
      )}

      <div className="h-px bg-border" />

      {/* مشخصات کامل — یک کشوی جمع‌وجور برای همه‌ی متای فرعی (عین طرح تأییدشده) */}
      <section className="py-6" aria-label="مشخصات کامل">
        <AppDetailsDrawer
          developer={app.developerName || "نامشخص"}
          license={app.license || null}
          updatedLabel={v ? formatDate(v.publishedAt || v.createdAt) : "—"}
          sourceHref={app.sourceUrl || null}
          sourceLabel={
            app.sourceUrl
              ? app.sourceType === "fdroid"
                ? "F-Droid"
                : (() => { try { return new URL(app.sourceUrl).hostname.replace(/^www\./, ""); } catch { return app.sourceUrl; } })()
              : "داخلی"
          }
          minAndroidLabel={app.platform === "android" ? androidVersion(v?.minSdk) : null}
          verifiedLabel={v?.verifiedAt ? formatDate(v.verifiedAt) : null}
          sha256={v?.sha256 ?? null}
          permissions={app.permissions.map((p) => p.permission)}
          appId={app.id}
          appName={app.nameFa}
        />
      </section>

      {/* جایگزین‌ها */}
      {altEntry && altApps.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <div className="py-6">
            <Alternatives entry={altEntry} apps={altApps} />
          </div>
        </>
      )}

      {/* دسته‌بندی‌ها */}
      {app.categories.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <section className="py-6" aria-label="دسته‌بندی‌ها">
            <h2 className="font-extrabold text-[17px] px-1 mb-3">دسته‌بندی</h2>
            <div className="flex flex-wrap gap-2 px-1">
              {app.categories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`}
                  className="text-[13px] bg-card border border-border rounded-full px-4 py-2 inline-flex items-center gap-1.5">
                  <DbIcon icon={c.icon} className="w-4 h-4 text-primary" /> {c.nameFa}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="h-px bg-border" />
      <div className="py-6 px-1 space-y-3">
        <ReportButton appId={app.id} appName={app.nameFa} />
        <Link href={`/report?app=${app.slug}`}
          className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground py-2">
          <TriangleAlert className="w-4 h-4" aria-hidden="true" /> گزارش مشکل یا لینک خراب
        </Link>
      </div>

      {/* شاید بپسندی */}
      {app.similar.length > 0 && (
        <section className="mt-8" aria-label="شاید بپسندی">
          <h2 className="text-[17px] font-extrabold mb-4 px-1">شاید بپسندی</h2>
          <div className="space-y-2.5">
            {app.similar.slice(0, 6).map((a, i) => <AppCard key={a.id} app={a} index={i} variant="horizontal" hideStats />)}
          </div>
        </section>
      )}
    </div>
  );
}

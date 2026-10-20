import Link from "next/link";
import PxImg from "@/components/PxImg";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/store";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { toFaDigits, formatDate, timeAgo, formatBytesEn, androidVersionEn } from "@/lib/fa";
import AppTile from "@/components/AppTile";
import FavoriteButton from "@/components/FavoriteButton";
import FollowButton from "@/components/FollowButton";
import ShareButton from "@/components/ShareButton";
import VersionsDrawer from "@/components/VersionsDrawer";
import DownloadButtons from "@/components/DownloadButtons";
import HashBlock from "@/components/HashBlock";
import Gallery from "@/components/Gallery";
import { computeTags } from "@/lib/tags";
import { px } from "@/lib/img";
import DbIcon from "@/components/DbIcon";
import ReportButton from "@/components/ReportButton";
import Alternatives from "@/components/Alternatives";
import { findAlternatives } from "@/data/alternatives";
import { RefreshCw, BadgeCheck, TriangleAlert } from "lucide-react";
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
      title: `دانلود ${app.nameFa} برای ${platFa} | Vesper`,
      description: desc,
      images: app.iconUrl && px(app.iconUrl) ? [siteUrl() + px(app.iconUrl)!] : undefined,
    },
  };
}

function InfoRow({ k, v, ltr = false }: { k: string; v: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border last:border-0 text-[13px]">
      <dt className="opacity-60 shrink-0">{k}</dt>
      <dd className="font-medium text-left break-all min-w-0" dir={ltr ? "ltr" : "rtl"}>{v}</dd>
    </div>
  );
}

// تیتر بخش جهت «ج»: لیبل مونو سبز + تیتر فارسی
function SecHead({ code, title }: { code: string; title: string }) {
  return (
    <div className="mb-2.5">
      <span className="block font-mono text-[10.5px] text-primary" dir="ltr" style={{ textAlign: "right" }}>{code}</span>
      <h2 className="text-[15px] font-extrabold leading-snug">{title}</h2>
    </div>
  );
}

// خانه‌ی متاگرید جهت «ج» — کلید مونو لاتین + مقدار مونو
function MetaCell({ k, v, end = false, bottom = false }: { k: string; v: React.ReactNode; end?: boolean; bottom?: boolean }) {
  return (
    <div className={`px-3 py-2.5 bg-surface ${end ? "border-e border-border" : ""} ${bottom ? "border-b border-border" : ""}`}>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted" dir="ltr" style={{ textAlign: "right" }}>{k}</div>
      <div className="font-mono text-[13px] mt-0.5 truncate" dir="ltr" style={{ textAlign: "right" }}>{v}</div>
    </div>
  );
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
      {/* هدر برنامه — جهت «ج» */}
      <div className="flex gap-3.5 items-center">
        {app.iconUrl ? (
          <PxImg src={px(app.iconUrl) || "/icons/icon-192.png"} alt={`آیکون ${app.nameFa}`} width={56} height={56}
            className="w-14 h-14 rounded-[9px] object-cover shrink-0" />
        ) : (
          <span className="w-14 h-14 rounded-[9px] bg-surface-2 text-primary flex items-center justify-center text-2xl font-bold shrink-0">
            {app.nameFa.charAt(0)}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h1 title={app.nameFa} className="text-[19px] font-extrabold leading-[1.35] break-words line-clamp-2">{app.nameFa}</h1>
          {app.developerName && (
            <p className="text-[12.5px] text-muted mt-0.5">{app.developerName}</p>
          )}
          {app.packageName && (
            <p className="font-mono text-[11px] text-primary mt-0.5 truncate" dir="ltr" style={{ textAlign: "right" }}>{app.packageName}</p>
          )}
        </div>
        <div className="flex flex-row gap-1 shrink-0">
          <FavoriteButton appId={app.id} appName={app.slug} />
          <FollowButton appId={app.id} />
          <ShareButton appName={app.nameFa} slug={app.slug} />
        </div>
      </div>

      {/* متاگرید مشخصات — جهت «ج» */}
      <div className="grid grid-cols-2 border border-border rounded-lg overflow-hidden my-4" aria-label="مشخصات فنی">
        <MetaCell k="VERSION" v={v?.versionName ?? "—"} end bottom />
        <MetaCell k="SIZE" v={formatBytesEn(v?.fileSize)} bottom />
        <MetaCell k="LICENSE" v={app.license || "—"} end />
        {app.platform === "android"
          ? <MetaCell k="MIN ANDROID" v={androidVersionEn(v?.minSdk ?? app.minSdk)} />
          : <MetaCell k="PLATFORM" v={app.platform} />}
      </div>

      {/* بنر آپدیت */}
      {hasUpdate && v && (
        <div className="border border-primary/40 bg-primary-soft rounded-lg px-3.5 py-3 mb-4 flex items-center gap-2.5" role="status">
          <RefreshCw className="w-5 h-5 shrink-0 text-primary" aria-hidden="true" />
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

      {/* دانلود */}
      <DownloadButtons
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
      />

      {/* زیرردیف دانلود — صفحه‌ی رسمی + گزارش مشکل */}
      <div className="flex items-center justify-between mt-3 text-[12.5px]">
        {app.sourceUrl ? (
          <a href={app.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold border-b border-primary pb-px">
            صفحه‌ی رسمی
          </a>
        ) : (
          <span />
        )}
        <ReportButton appId={app.id} appName={app.nameFa} />
      </div>

      {/* تصاویر */}
      {app.screenshots.length > 0 && (
        <section className="py-6" aria-label="تصاویر محیط برنامه">
          <SecHead code="// screenshots" title="پیش‌نمایش" />
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
            <SecHead code="// about" title="درباره‌ی این برنامه" />
            <p className="text-[13.5px] leading-8 whitespace-pre-line text-fg/85">{stripMd(app.descriptionFa || app.description)}</p>
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

      {/* جزئیات — جهت «ج» */}
      <section className="py-6" aria-label="جزئیات">
        <SecHead code="// details" title="جزئیات" />
        <div className="border border-border bg-surface rounded-lg px-4 py-2">
          <dl>
            <InfoRow k="توسعه‌دهنده" v={app.developerName || "نامشخص"} />
            <InfoRow k="به‌روزرسانی" v={v ? timeAgo(v.publishedAt || v.createdAt) : "—"} />
            {(app.githubStars ?? 0) > 0 && (
              <InfoRow k="ستاره‌ی گیت‌هاب" v={<span className="font-mono" dir="ltr">{(app.githubStars ?? 0).toLocaleString("en-US")}</span>} />
            )}
            <InfoRow k="منبع" v={app.sourceUrl ? (
              <a href={app.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary" dir="ltr">
                {app.sourceType === "fdroid" ? "F-Droid" : new URL(app.sourceUrl).hostname.replace(/^www\./, "")}
              </a>
            ) : "داخلی"} />
            <div className="flex justify-between items-center gap-4 py-2 text-[13px]">
              <dt className="opacity-60 shrink-0">وضعیت بررسی</dt>
              <dd>
                {v?.verifiedAt ? (
                  <span className="inline-flex items-center gap-1 border border-primary/40 text-primary rounded px-2 py-0.5 text-[11.5px] font-bold">
                    <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> {formatDate(v.verifiedAt)}
                  </span>
                ) : (
                  <span className="border border-border text-muted rounded px-2 py-0.5 text-[11.5px]">در انتظار بررسی</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* هش و مجوزها — جهت «ج» */}
        {(v?.sha256 || app.permissions.length > 0) && (
          <div className="mt-5">
            <SecHead code="// security" title="هش و مجوزها" />
            <div className="space-y-2.5">
              {v?.sha256 && <HashBlock hash={v.sha256} />}
              {app.permissions.length > 0 && (
                <div className="collapse collapse-arrow border border-border bg-surface rounded-lg">
                  <input type="checkbox" />
                  <div className="collapse-title text-[13px] font-bold py-3 min-h-0">مجوزهای درخواستی ({toFaDigits(app.permissions.length)})</div>
                  <div className="collapse-content">
                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                      {app.permissions.map((p) => (
                        <span key={p.id} className="border border-border rounded px-2 py-0.5 font-mono text-[10.5px] text-muted" dir="ltr">{p.permission}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
            <SecHead code="// categories" title="دسته‌بندی" />
            <div className="flex flex-wrap gap-2 px-1">
              {app.categories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`}
                  className="text-[12.5px] font-bold bg-surface border border-border rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5 hover:border-primary transition-colors">
                  <DbIcon icon={c.icon} className="w-4 h-4 text-primary" /> {c.nameFa}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="h-px bg-border" />
      <div className="py-5 px-1">
        <Link href={`/report?app=${app.slug}`}
          className="flex items-center justify-center gap-2 text-[12.5px] text-muted hover:text-fg transition-colors py-1">
          <TriangleAlert className="w-4 h-4" aria-hidden="true" /> فرم کامل گزارش مشکل یا لینک خراب
        </Link>
      </div>

      {/* شاید بپسندی */}
      {app.similar.length > 0 && (
        <section className="mt-8" aria-label="شاید بپسندی">
          <SecHead code="// similar" title="شاید بپسندی" />
          <div className="grid grid-cols-3 gap-4">
            {app.similar.slice(0, 6).map((a, i) => <AppTile key={a.id} app={a} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

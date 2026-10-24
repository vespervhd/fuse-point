import Link from "next/link";
import PxImg from "@/components/PxImg";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/store";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { toFaDigits, formatBytes, formatDate, timeAgo, androidVersion } from "@/lib/fa";
import AppCard from "@/components/AppCard";
import FavoriteButton from "@/components/FavoriteButton";
import FollowButton from "@/components/FollowButton";
import ShareButton from "@/components/ShareButton";
import VersionsDrawer from "@/components/VersionsDrawer";
import DownloadButtons, { PlatformIcon } from "@/components/DownloadButtons";
import Gallery from "@/components/Gallery";
import { computeTags } from "@/lib/tags";
import { px } from "@/lib/img";
import DbIcon from "@/components/DbIcon";
import ReportButton from "@/components/ReportButton";
import Alternatives from "@/components/Alternatives";
import { findAlternatives } from "@/data/alternatives";
import {
  RefreshCw, Download,
  BadgeCheck, TriangleAlert, ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

function InfoRow({ k, v, ltr = false }: { k: string; v: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border last:border-0 text-[13px]">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="font-medium text-left break-all min-w-0" dir={ltr ? "ltr" : "rtl"}>{v}</dd>
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
      {/* هدر اپ — آیکون بزرگ + مشخصات اصلی؛ دکمه‌ی دانلود سوار بر لبه‌ی پایین کارت */}
      <div className="relative mb-9">
      <Card className="shadow-sm py-0 gap-0">
        <CardContent className="p-5 sm:p-6 pb-10">
          <div className="flex gap-4 items-start">
            {app.iconUrl ? (
              <PxImg src={px(app.iconUrl) || "/icons/icon-192.png"} alt={`آیکون ${app.nameFa}`} width={88} height={88}
                className="w-[88px] h-[88px] rounded-[24%] object-cover shadow-md shrink-0" />
            ) : (
              <span className="w-[88px] h-[88px] rounded-[24%] bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold shrink-0">
                {app.nameFa.charAt(0)}
              </span>
            )}
            <div className="flex-1 min-w-0 pt-1">
              <h1 title={app.nameFa} className="text-[19px] font-extrabold leading-7 break-words line-clamp-2">{app.nameFa}</h1>
            </div>
            <div className="flex flex-row gap-2 shrink-0 pt-1">
              <FavoriteButton appId={app.id} appName={app.slug} />
              <FollowButton appId={app.id} />
              <ShareButton appName={app.nameFa} slug={app.slug} />
            </div>
          </div>

          {/* مشخصات اصلی — فقط پلتفرم، نسخه، حجم */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <Badge variant="outline" className="h-7 px-3.5 text-sm rounded-full gap-1.5 border-border bg-muted/50">
              <PlatformIcon platform={app.platform} className="w-4 h-4" />
              {app.platform === "android" ? "اندروید" : app.platform === "windows" ? "ویندوز" : "لینوکس"}
            </Badge>
            {v?.versionName && (
              <Badge variant="outline" className="h-7 px-3.5 text-sm rounded-full gap-1.5 border-border bg-muted/50">
                نسخه <span dir="ltr">{v.versionName}</span>
              </Badge>
            )}
            {v?.fileSize ? (
              <Badge variant="outline" className="h-7 px-3.5 text-sm rounded-full gap-1.5 border-border bg-muted/50">
                <Download className="w-4 h-4" aria-hidden="true" /> {formatBytes(v.fileSize)}
              </Badge>
            ) : null}
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

        </CardContent>
      </Card>

      {/* دانلود — سوار بر لبه‌ی پایین کارت */}
      <div className="absolute inset-x-0 -bottom-5 z-10 flex justify-center px-3">
        <div className="[&_a]:shadow-xl">
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
        </div>
      </div>
      </div>

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

      {/* مشخصات و جزئیات — یک کشوی جمع‌وجور برای همه‌ی متای فرعی */}
      <section className="py-6" aria-label="مشخصات و جزئیات">
        <details className="group bg-card text-card-foreground border border-border rounded-2xl shadow-sm overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 [&::-webkit-details-marker]:hidden">
            <span className="text-[14px] font-extrabold">مشخصات و جزئیات</span>
            <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-4 pb-4">
            <dl>
              <InfoRow k="پلتفرم" v={app.platform === "android" ? "اندروید" : app.platform === "windows" ? "ویندوز" : "لینوکس"} />
              <InfoRow k="نسخه" v={v?.versionName ?? "—"} ltr={!!v?.versionName} />
              <InfoRow k="حجم" v={formatBytes(v?.fileSize)} />
              {app.platform === "android" && (
                <InfoRow k="حداقل اندروید" v={androidVersion(v?.minSdk)} />
              )}
              <InfoRow k="توسعه‌دهنده" v={app.developerName || "نامشخص"} />
              <InfoRow k="مجوز" v={app.license || "—"} ltr={!!app.license} />
              <InfoRow k="به‌روزرسانی" v={v ? timeAgo(v.publishedAt || v.createdAt) : "—"} />
              <InfoRow k="منبع" v={app.sourceUrl ? (
                <a href={app.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary" dir="ltr">
                  {app.sourceType === "fdroid" ? "F-Droid" : new URL(app.sourceUrl).hostname.replace(/^www\./, "")}
                </a>
              ) : "داخلی"} />
              <div className="flex justify-between items-center gap-4 py-2 text-[13px]">
                <dt className="text-muted-foreground shrink-0">وضعیت بررسی</dt>
                <dd>
                  {v?.verifiedAt ? (
                    <Badge variant="success" className="gap-1 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> {formatDate(v.verifiedAt)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="rounded-full">در انتظار بررسی</Badge>
                  )}
                </dd>
              </div>
            </dl>

            {v?.sha256 && (
              <div className="mt-3">
                <p className="text-[12px] font-bold text-muted-foreground mb-1.5">هش SHA-256</p>
                <code className="block p-3 bg-muted rounded-xl break-all font-mono text-[11px]" dir="ltr">{v.sha256}</code>
              </div>
            )}

            {app.permissions.length > 0 && (
              <div className="mt-3">
                <p className="text-[12px] font-bold text-muted-foreground mb-1.5">مجوزهای درخواستی ({toFaDigits(app.permissions.length)})</p>
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                  {app.permissions.map((p) => (
                    <Badge key={p.id} variant="secondary" className="font-mono rounded-full" dir="ltr">{p.permission}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
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

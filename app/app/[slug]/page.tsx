import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAppHeadCore, getAppMetaCore } from "@/lib/store";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { RefreshCw } from "lucide-react";
import { AppTop, AppRest } from "@/components/AppBody";
import Capsules from "@/components/Capsules";
import { siteUrl } from "@/lib/site-url";
import { px } from "@/lib/img";
import { getLocale } from "@/lib/i18n-server";
import { toPlainText } from "@/lib/text";
import { STR, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppMetaCore(slug);
  const locale = await getLocale();
  if (!app) return { title: locale === "fa" ? "یافت نشد" : "Not found" };
  const platFa = app.platform === "android" ? "اندروید" : app.platform === "windows" ? "ویندوز" : "لینوکس";
  const platEn = app.platform === "android" ? "Android" : app.platform === "windows" ? "Windows" : "Linux";
  const title = locale === "fa"
    ? `دانلود ${app.nameFa} برای ${platFa}`
    : `Download ${app.nameEn || app.nameFa} for ${platEn}`;
  const desc = toPlainText(locale === "fa"
    ? app.shortDescFa || app.shortDesc || `دانلود ${app.nameFa} برای ${platFa} با لینک مستقیم و بررسی امنیتی`
    : app.shortDesc || app.shortDescFa || `Download ${app.nameEn || app.nameFa} for ${platEn} — direct link, security-checked`);
  return {
    title,
    description: desc,
    alternates: { canonical: `/app/${slug}` },
    openGraph: {
      title,
      description: desc,
      images: app.iconUrl && px(app.iconUrl) ? [siteUrl() + px(app.iconUrl)!] : undefined,
    },
  };
}

// بنر آپدیت — عمداً بیرون از بدنه‌ی کش‌شده: به نشستِ کاربر وابسته است و هرگز
// نباید برای کاربرِ دیگری کش شود. فقط وقتی کاربر لاگین‌کرده و نسخه‌ی قدیمی‌تری
// را دانلود کرده باشد چیزی نشان می‌دهد.
async function UpdateBanner({ head, locale }: {
  head: { id: string; platform: string; current: { id: string; versionName: string | null } | null };
  locale: Locale;
}) {
  const d = STR[locale];
  const v = head.current;
  if (!v || head.platform !== "android") return null;
  try {
    const user = await getSessionUser();
    if (!user) return null;
    const dls = await db.select({ versionId: s.downloadEvents.versionId })
      .from(s.downloadEvents)
      .where(and(eq(s.downloadEvents.userId, user.id), eq(s.downloadEvents.appId, head.id)))
      .orderBy(desc(s.downloadEvents.createdAt)).limit(1);
    if (!dls.length || !dls[0].versionId || dls[0].versionId === v.id) return null;
    const dv = await db.select({ versionName: s.appVersions.versionName })
      .from(s.appVersions).where(eq(s.appVersions.id, dls[0].versionId!)).limit(1);
    const downloadedVersion = dv[0]?.versionName ?? null;
    return (
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
    );
  } catch {
    return null;
  }
}

export default async function AppPage({ params }: Props) {
  const { slug } = await params;
  const head = await getAppHeadCore(slug);
  if (!head) notFound();
  const locale = await getLocale();

  return (
    <div className="animate-fade-up">
      {/* ۱) کارت دانلود — بلوک اصلی بالای صفحه */}
      <AppTop slug={slug} locale={locale} />

      {/* ۲) کپسول‌های دنبال‌کردن و نشان — زیر هدر کارت، بالای خط اطلاعات فایل */}
      <Capsules appId={head.id} slug={slug} locale={locale} />

      {/* بنر آپدیت برای کاربری که نسخه‌ی قدیمی‌تر را دانلود کرده */}
      <UpdateBanner head={head} locale={locale} />

      {/* بقیه‌ی بدنه‌ی عمومی — با کشِ رندر */}
      <AppRest slug={slug} locale={locale} />
    </div>
  );
}

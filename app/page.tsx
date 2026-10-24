import Link from "next/link";
import { ChevronLeft, SearchX } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import AppRow, { PlatformChip } from "@/components/AppRow";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import {
  getLatestApps, getHomeStats, getFeaturedApp, attachPrimaryCategory,
  type Platform,
} from "@/lib/store";
import { getLocale } from "@/lib/i18n-server";
import { STR, appName, appShort, catName, num, type Locale } from "@/lib/i18n";

type Props = { searchParams: Promise<{ platform?: string }> };

const platQs = (p: Platform) => (p === "android" ? "" : `?platform=${p}`);

function EntryRow({ href, title, locale }: { href: string; title: string; locale: Locale }) {
  const d = STR[locale];
  return (
    <div className="flex items-center justify-between gap-2.5 px-0.5 min-h-12 py-0.5">
      <span className="text-[15.5px] font-extrabold">{title}</span>
      <Link href={href} className="inline-flex items-center gap-1 text-primary text-[13px] font-bold min-h-[44px] px-1.5 py-1.5 rounded-[10px] hover:bg-primary/[0.08]">
        {d.seeAll}
        <span className="flip-x grid place-items-center" aria-hidden="true">
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        </span>
      </Link>
    </div>
  );
}

export default async function Home({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const qs = platQs(plat);

  const [featured, latest, stats] = await Promise.all([
    getFeaturedApp(plat),
    getLatestApps(48, plat),
    getHomeStats(plat),
  ]);
  const catMap = await attachPrimaryCategory(latest);

  return (
    <div>
      {/* لوگوی کرونای چرخان + کارت جستجو — بدون هیچ تیتر/متن (عین نمونه) */}
      <HeroSearch />

      <section className="mt-[42px]" aria-label={d.allApps}>
        {/* ورودی نماها: دسته‌بندی‌ها / مجموعه‌ها / تازه‌ها */}
        <div className="flex flex-col gap-0.5 mb-[22px]">
          <EntryRow href={`/categories${qs}`} title={d.cats} locale={locale} />
          <EntryRow href={`/collections${qs}`} title={d.colsTitle} locale={locale} />
          <EntryRow href={`/fresh${qs}`} title={d.fresh} locale={locale} />
        </div>

        {/* بلوک برگزیده‌ی همین پلتفرم */}
        {featured && (
          <>
            <p className="flex items-baseline justify-between gap-2.5 text-muted-foreground text-[13px] font-bold mx-0.5 mb-2">
              <span>{d.featured}</span>
            </p>
            <Link
              href={`/app/${featured.slug}`}
              className="flex items-center gap-[15px] bg-card border border-border rounded-[18px] p-4 mb-7 shadow-sm hover:bg-card/80 transition-colors"
            >
              <span className="w-16 h-16 rounded-[17px] grid place-items-center overflow-hidden shrink-0 bg-primary/[0.13] border border-primary/25 text-primary">
                {featured.iconUrl ? (
                  <PxImg src={px(featured.iconUrl) || featured.iconUrl} alt="" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold" dir="ltr">{(featured.nameEn || "?").charAt(0)}</span>
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-lg font-extrabold truncate" dir="auto">{appName(featured, locale)}</span>
                {appShort(featured, locale) && (
                  <span className="block text-muted-foreground text-[13px] mt-1 leading-[1.8] line-clamp-2">{appShort(featured, locale)}</span>
                )}
                <span className="flex flex-wrap gap-1.5 mt-[9px]">
                  <PlatformChip platform={plat} locale={locale} />
                </span>
              </span>
              <span className="flip-x text-muted-foreground grid place-items-center shrink-0" aria-hidden="true">
                <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
              </span>
            </Link>
          </>
        )}

        {/* فهرست ادیتوریال همه‌ی برنامه‌های این پلتفرم */}
        <p className="flex items-baseline justify-between gap-2.5 text-muted-foreground text-[13px] font-bold mx-0.5 mb-2">
          <span>{d.allApps}</span>
          <span className="text-xs font-medium whitespace-nowrap">{num(stats.apps, locale)} {locale === "fa" ? "اپ" : "apps"}</span>
        </p>
        {latest.length ? (
          <>
            <div className="border-t border-border">
              {latest.map((a, i) => {
                const c = catMap.get(a.id);
                return (
                  <AppRow
                    key={a.id}
                    app={a}
                    locale={locale}
                    platform={plat}
                    index={i}
                    categoryName={c ? catName(c, locale) : null}
                  />
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href={`/search${qs}`} className="inline-flex items-center gap-1 text-sm text-primary font-bold hover:underline">
                {d.moreApps}
                <span className="flip-x grid place-items-center" aria-hidden="true">
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </span>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-[34px] px-2.5 border border-dashed border-border rounded-[14px] text-[14.5px] leading-[1.9]">
            <SearchX className="w-8 h-8 mx-auto mb-2 text-primary" aria-hidden="true" />
            {d.emptyHome}
            <br />
            {d.tryAnotherPlatform}
          </div>
        )}
      </section>
    </div>
  );
}

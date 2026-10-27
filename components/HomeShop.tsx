// Homepage shop body (approved sample v4, real data): category chips that
// filter via navigation to real category pages, featured card, 2-column
// product grid, pager. Cached like the old HomeCatalog ("use cache").
import Link from "next/link";
import { SearchX, Download } from "lucide-react";
import { cacheLife } from "next/cache";
import AppIcon from "@/components/AppIcon";
import BidiText from "@/components/BidiText";
import ShopCard from "@/components/ShopCard";
import { Pager } from "@/components/CachedCatalog";
import { EmptyState } from "@/components/Bits";
import { px } from "@/lib/img";
import {
  getFeaturedAppCore, getLatestAppsCore, getHomeStatsCore,
  getRootCategoriesCore, type Platform,
} from "@/lib/store";
import { STR, appName, appShort, catName, num, bytesL, platName, type Locale } from "@/lib/i18n";

export async function HomeShop({ plat, locale, page }: { plat: Platform; locale: Locale; page: number }) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 3600 });
  const d = STR[locale];
  const qs = plat === "android" ? "" : `?platform=${plat}`;
  const [featured, stats, cats] = await Promise.all([
    getFeaturedAppCore(plat),
    getHomeStatsCore(plat),
    getRootCategoriesCore(plat),
  ]);
  const totalPages = Math.max(1, Math.ceil(stats.apps / 24));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const latest = await getLatestAppsCore(24, plat, (safePage - 1) * 24);

  return (
    <div>
      {/* Category chips — "All" is this page; each chip navigates to the real
          category page (server-filtered), never a fake in-place subset. */}
      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto pb-0.5" role="list" aria-label={d.cats}>
        <Link href={`/${qs}`} aria-current="true" className="pill pill-on motion-press">
          {d.allCats}
        </Link>
        {cats.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}${qs}`} className="pill motion-press">
            {catName(c, locale)}
          </Link>
        ))}
      </div>

      {/* Featured card (first page only) — sample layout: text + big tinted
          tile, full-width download button. */}
      {safePage === 1 && featured && (
        <>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold">{d.featured}</h2>
            <span className="text-muted-foreground text-lg tracking-[8px]" aria-hidden="true">‹ ›</span>
          </div>
          <section className="mb-5 rounded-[20px] border border-border bg-card p-4">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-extrabold leading-7">
                  <Link href={`/app/${featured.slug}${qs ? `?platform=${plat}` : ""}`} className="hover:text-primary">
                    {appName(featured, locale)}
                  </Link>
                </h3>
                {appShort(featured, locale) && (
                  <p className="mt-0.5 text-[13.5px] leading-6 text-muted-foreground line-clamp-2">
                    <BidiText text={appShort(featured, locale)} />
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {platName(locale, plat)} • <b className="text-foreground">{bytesL(featured.fileSize, locale)}</b>
                  {featured.versionName && <> • <span dir="ltr">{featured.versionName}</span></>}
                </p>
              </div>
              <span className="grid size-[92px] shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f6e7c8]" aria-hidden="true">
                <AppIcon
                  src={featured.iconUrl ? px(featured.iconUrl, "icon") || featured.iconUrl : null}
                  name={featured.nameEn || featured.nameFa}
                  width={92}
                  height={92}
                  imgClassName="size-16 rounded-2xl object-cover"
                  letterClassName="text-4xl font-extrabold text-[#1e2b52]"
                />
              </span>
            </div>
            <a
              href={featured.versionId ? `/api/download/${featured.versionId}` : `/app/${featured.slug}`}
              className="motion-press mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15.5px] font-extrabold text-primary-foreground"
            >
              <Download className="size-5" aria-hidden="true" />
              {d.download}
            </a>
          </section>
        </>
      )}

      {/* Product grid */}
      <div className="mb-2.5 flex items-baseline justify-between gap-2.5">
        <h2 className="text-[15px] font-extrabold">{d.allApps}</h2>
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {num(stats.apps, locale)} {locale === "fa" ? "اپ" : "apps"}
        </span>
      </div>
      {latest.length ? (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            {latest.map((a, i) => (
              <ShopCard key={a.id} app={a} locale={locale} index={i} />
            ))}
          </div>
          <Pager base={`/${qs}`} page={safePage} pages={totalPages} locale={locale} />
        </>
      ) : (
        <EmptyState
          icon={<SearchX className="size-8 text-primary" aria-hidden="true" />}
          text={d.emptyHome}
          sub={d.tryAnotherPlatform}
        />
      )}
    </div>
  );
}

// بخش‌های سنگینِ عمومی با کشِ رندر (Next 16 «use cache»)
// دلیل: صفحه‌ها به‌خاطر کوکیِ زبان و ?platform= ذاتاً داینامیک‌اند، پس ISRِ تمام‌صفحه
// ممکن نیست؛ در عوض بدنه‌ی سنگین (فهرست‌ها) کش می‌شود و پوسته‌ی نازک (هدر/زبان)
// هر درخواست رندر می‌شود. کلیدِ کش خودکار از روی props ساخته می‌شود، پس هر ترکیبِ
// (پلتفرم، زبان، صفحه، اسلاگ) نسخه‌ی کشِ جدای خودش را دارد. بخش‌های کاربر-محور
// (علاقه‌مندی، دنبال‌کردن، بنر آپدیت) بیرون از این کامپوننت‌ها و سمتِ کلاینت/داینامیک‌اند.
import Link from "next/link";
import { ChevronLeft, SearchX, Sparkles, LayoutGrid, Layers, Inbox } from "lucide-react";
import { cacheLife } from "next/cache";
import AppRow, { PlatformChip } from "@/components/AppRow";
import PxImg from "@/components/PxImg";
import DbIcon from "@/components/DbIcon";
import { BackLink, ViewHead, EmptyState, SectionHead } from "@/components/Bits";
import { px } from "@/lib/img";
import {
  getFeaturedAppCore, getLatestAppsCore, getNewestAppsCore, getHomeStatsCore,
  getRootCategoriesCore, getCollectionsCore, getCollectionBySlugCore,
  getCategoryBySlugCore, getCategoryAppsCore, getChildPreviewsCore,
  attachPrimaryCategory, type Platform,
} from "@/lib/store";
import { STR, appName, appShort, catName, num, appsCount, type Locale } from "@/lib/i18n";

// صفحه‌بندیِ پنجره‌ای با همان استایلِ صفحه‌ی دسته (دکمه‌های ۴۰px)؛ برای فهرست‌های
// طولانی (مثلاً ۷۵ صفحه در صفحه‌ی اصلی) همه‌ی شماره‌ها رندر نمی‌شوند.
function Pager({ base, page, pages, locale }: { base: string; page: number; pages: number; locale: Locale }) {
  if (pages <= 1) return null;
  const win: number[] = [];
  for (let p = Math.max(1, page - 3); p <= Math.min(pages, page + 3); p++) win.push(p);
  if (!win.includes(1)) win.unshift(1);
  if (!win.includes(pages)) win.push(pages);
  const href = (p: number) => `${base}${base.includes("?") ? "&" : "?"}page=${p}`;
  const btn = (active: boolean) =>
    `min-w-[40px] h-10 px-2 grid place-items-center rounded-xl border text-sm font-bold ${
      active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
    }`;
  return (
    <nav className="flex justify-center flex-wrap gap-1.5 mt-8" aria-label="pagination">
      {page > 1 && (
        <Link href={href(page - 1)} className={btn(false)} aria-label="prev">
          <span className="flip-x grid place-items-center" aria-hidden="true"><ChevronLeft className="w-4 h-4" strokeWidth={2} /></span>
        </Link>
      )}
      {win.map((p) => (
        <Link key={p} href={href(p)} aria-current={p === page ? "page" : undefined} className={btn(p === page)}>
          {num(p, locale)}
        </Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className={btn(false)} aria-label="next">
          <span className="grid place-items-center" aria-hidden="true"><ChevronLeft className="w-4 h-4 rotate-180" strokeWidth={2} /></span>
        </Link>
      )}
    </nav>
  );
}

// ─── صفحه‌ی اصلی: بلوک برگزیده + فهرست (۲۴ ردیف در هر صفحه) ───
export async function HomeCatalog({ plat, locale, page }: { plat: Platform; locale: Locale; page: number }) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 3600 });
  const d = STR[locale];
  const qs = plat === "android" ? "" : `?platform=${plat}`;
  const [featured, stats] = await Promise.all([getFeaturedAppCore(plat), getHomeStatsCore(plat)]);
  const totalPages = Math.max(1, Math.ceil(stats.apps / 24));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const latest = await getLatestAppsCore(24, plat, (safePage - 1) * 24);
  const catMap = await attachPrimaryCategory(latest);
  return (
    <>
      {safePage === 1 && featured && (
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
                <PxImg src={px(featured.iconUrl, "icon") || featured.iconUrl} alt="" width={64} height={64} className="w-full h-full object-cover" />
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
          <Pager base={`/${qs}`} page={safePage} pages={totalPages} locale={locale} />
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
    </>
  );
}

// ─── تازه‌ها: جدیدترین‌ها + آخرین به‌روزرسانی‌ها ───
export async function FreshLists({ plat, locale }: { plat: Platform; locale: Locale }) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 3600 });
  const d = STR[locale];
  const [newest, updated] = await Promise.all([
    getNewestAppsCore(24, plat),
    getLatestAppsCore(24, plat),
  ]);
  const [newCatMap, updCatMap] = await Promise.all([
    attachPrimaryCategory(newest),
    attachPrimaryCategory(updated),
  ]);
  const renderList = (items: typeof newest, catMap: typeof newCatMap) => (
    <div className="border-t border-border">
      {items.map((a, i) => {
        const c = catMap.get(a.id);
        return (
          <AppRow key={a.id} app={a} locale={locale} platform={plat} index={i} categoryName={c ? catName(c, locale) : null} />
        );
      })}
    </div>
  );
  return (
    <>
      <section aria-label={d.freshNew}>
        <SectionHead title={d.freshNew} locale={locale} />
        {newest.length ? renderList(newest, newCatMap) : (
          <EmptyState icon={<Sparkles className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
        )}
      </section>
      <section className="mt-12" aria-label={d.freshUpd}>
        <SectionHead title={d.freshUpd} locale={locale} />
        {updated.length ? renderList(updated, updCatMap) : (
          <EmptyState icon={<Sparkles className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
        )}
      </section>
    </>
  );
}

// ─── نمای دسته‌بندی‌ها (گرید کاشی‌ها) ───
export async function CategoriesGrid({ plat, locale }: { plat: Platform; locale: Locale }) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 3600 });
  const d = STR[locale];
  const cats = await getRootCategoriesCore(plat);
  const qs = plat === "android" ? "" : `?platform=${plat}`;
  if (!cats.length) {
    return <EmptyState icon={<LayoutGrid className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />;
  }
  return (
    <div className="grid grid-cols-2 gap-[11px]">
      {cats.map((c) => (
        <Link
          key={c.id}
          href={`/category/${c.slug}${qs}`}
          className="flex flex-col items-start gap-2.5 bg-card border border-border rounded-[18px] p-[18px] shadow-sm hover:border-primary/60 transition-colors"
        >
          <span className="w-[46px] h-[46px] rounded-[13px] grid place-items-center text-primary bg-primary/10 border border-primary/[0.22]">
            <DbIcon icon={c.icon} className="w-[23px] h-[23px]" />
          </span>
          <span className="text-[15px] font-extrabold leading-[1.7]">{catName(c, locale)}</span>
          <span className="text-muted-foreground text-xs">{appsCount(c.appCount, locale)}</span>
        </Link>
      ))}
    </div>
  );
}

// ─── نمای مجموعه‌ها ───
export async function CollectionsGrid({ plat, locale }: { plat: Platform; locale: Locale }) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 3600 });
  const d = STR[locale];
  const collections = await getCollectionsCore(plat);
  const qs = plat === "android" ? "" : `?platform=${plat}`;
  if (!collections.length) {
    return <EmptyState icon={<Layers className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />;
  }
  return (
    <div className="flex flex-col gap-2.5">
      {collections.map((c) => (
        <Link
          key={c.id}
          href={`/collection/${c.slug}${qs}`}
          className="flex items-center gap-3.5 bg-card border border-border rounded-[18px] p-4 shadow-sm hover:border-primary/60 transition-colors"
        >
          <span className="w-[46px] h-[46px] rounded-[13px] grid place-items-center text-primary bg-primary/10 border border-primary/[0.22] shrink-0">
            <DbIcon icon={c.icon} className="w-[23px] h-[23px]" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[15.5px] font-extrabold truncate">{c.nameFa}</span>
            <span className="block text-muted-foreground text-xs mt-[3px]">{appsCount(c.appCount, locale)}</span>
          </span>
          <span className="flip-x text-muted-foreground grid place-items-center shrink-0" aria-hidden="true">
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── بدنه‌ی صفحه‌ی یک دسته (پیش‌نمایش زیردسته‌ها یا فهرست صفحه‌بندی‌شده) ───
export async function CategoryBody({ slug, sort, page, plat, locale }: {
  slug: string; sort: "popular" | "name" | "updated"; page: number; plat: Platform; locale: Locale;
}) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 3600 });
  const d = STR[locale];
  const cat = await getCategoryBySlugCore(slug);
  if (!cat) return null; // پوسته‌ی صفحه نبودن را با notFound بررسی می‌کند
  const perPage = 40;
  const previews = cat.children.length ? await getChildPreviewsCore(cat.id, 6, plat) : [];
  const data = !previews.length ? await getCategoryAppsCore(slug, perPage, (page - 1) * perPage, sort, plat) : null;
  const items = data?.items ?? [];
  const total = data?.total ?? previews.reduce((sum, p) => sum + p.total, 0);
  const pages = Math.ceil(total / perPage);
  const catMap = await attachPrimaryCategory(items);
  const qs = plat === "android" ? "" : `?platform=${plat}`;
  const head = (
    <>
      <BackLink href={`/categories${qs}`} label={d.backToCats} />
      <ViewHead title={catName(cat, locale)} sub={`${num(total, locale)} ${locale === "fa" ? "برنامه" : "apps"}`} />
    </>
  );
  if (!previews.length && !items.length) {
    return (
      <div className="animate-fade-up">
        {head}
        <EmptyState icon={<Inbox className="w-6 h-6" aria-hidden="true" />} text={d.emptyCat} />
      </div>
    );
  }
  if (previews.length > 0) {
    return (
      <div className="animate-fade-up">
        {head}
      <div className="space-y-10">
        {previews.map(({ category: ch, apps, total: t }) => (
          <section key={ch.id} aria-label={ch.nameFa}>
            <div className="flex items-baseline justify-between gap-2.5 mx-0.5 mb-2">
              <h2 className="text-[15.5px] font-extrabold">{catName(ch, locale)}</h2>
              {t > apps.length && (
                <Link href={`/category/${ch.slug}${qs}`} className="text-primary text-[13px] font-bold hover:underline">
                  {d.seeAll}
                </Link>
              )}
            </div>
            <div className="border-t border-border">
              {(apps as any[]).map((a: any, i: number) => (
                <AppRow key={a.id} app={a} locale={locale} platform={plat} index={i} categoryName={null} />
              ))}
            </div>
          </section>
        ))}
      </div>
      </div>
    );
  }
  return (
    <div className="animate-fade-up">
      {head}
      <div className="border-t border-border">
        {items.map((a: any, i: number) => {
          const c = catMap.get(a.id);
          return (
            <AppRow key={a.id} app={a} locale={locale} platform={plat} index={i} categoryName={c ? catName(c, locale) : null} />
          );
        })}
      </div>
      {pages > 1 && (
        <nav className="flex justify-center gap-1.5 mt-8" aria-label="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/category/${slug}?sort=${sort}&page=${p}${plat === "android" ? "" : `&platform=${plat}`}`}
              aria-current={p === page ? "page" : undefined}
              className={`min-w-[40px] h-10 px-2 grid place-items-center rounded-xl border text-sm font-bold ${
                p === page ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
              }`}
            >
              {num(p, locale)}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

// ─── بدنه‌ی صفحه‌ی یک مجموعه ───
export async function CollectionBody({ slug, plat, locale }: { slug: string; plat: Platform; locale: Locale }) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 3600 });
  const d = STR[locale];
  const col = await getCollectionBySlugCore(slug, plat);
  if (!col) return null; // پوسته‌ی صفحه نبودن را با notFound بررسی می‌کند
  const catMap = await attachPrimaryCategory(col.apps as any[]);
  const qs = plat === "android" ? "" : `?platform=${plat}`;
  const head = (
    <>
      <BackLink href={`/collections${qs}`} label={d.backCols} />
      <ViewHead
        title={col.nameFa}
        sub={col.description || `${num(col.apps.length, locale)} ${locale === "fa" ? "برنامه" : "apps"}`}
      />
    </>
  );
  if (!col.apps.length) {
    return (
      <div className="animate-fade-up">
        {head}
        <EmptyState icon={<Layers className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
      </div>
    );
  }
  return (
    <div className="animate-fade-up">
      {head}
      <div className="border-t border-border">
        {col.apps.map((a: any, i: number) => {
          const c = catMap.get(a.id);
          return (
            <AppRow key={a.id} app={a} locale={locale} platform={plat} index={i} categoryName={c ? catName(c, locale) : null} />
          );
        })}
      </div>
    </div>
  );
}

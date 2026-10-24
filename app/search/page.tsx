import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { searchApps, getRootCategories, attachPrimaryCategory, type Platform, type SearchFilters } from "@/lib/store";
import AppRow from "@/components/AppRow";
import { BackLink, ViewHead, EmptyState, clearBtnClass } from "@/components/Bits";
import { getLocale } from "@/lib/i18n-server";
import { STR, catName, num, type Locale } from "@/lib/i18n";

type Props = { searchParams: Promise<{ q?: string; sort?: string; page?: string; platform?: string; cat?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q || "";
  const locale = await getLocale();
  const d = STR[locale];
  return { title: q ? (locale === "fa" ? `جست‌وجو: ${q}` : `Search: ${q}`) : d.advSearch, robots: { index: false } };
}

const SORTS: { key: NonNullable<SearchFilters["sort"]>; fa: string; en: string }[] = [
  { key: "newest", fa: "جدیدترین", en: "Newest" },
  { key: "lightest", fa: "سبک‌ترین", en: "Lightest" },
  { key: "name", fa: "الفبا", en: "A–Z" },
];

// نمای جستجوی پیشرفته — متن + فیلتر دسته + مرتب‌سازی، در فضای پلتفرم فعال (عین نمونه)
export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const sort: NonNullable<SearchFilters["sort"]> =
    sp.sort === "lightest" || sp.sort === "name" ? sp.sort : "newest";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const perPage = 40;
  const plat: Platform = sp.platform === "windows" || sp.platform === "linux" ? sp.platform : "android";
  const locale: Locale = await getLocale();
  const d = STR[locale];
  const cat = sp.cat || "";
  const hasFilters = !!q || !!cat || sort !== "newest";

  const [{ items, total }, roots] = await Promise.all([
    searchApps(q, { sort, platform: plat, category: cat || undefined }, perPage, (page - 1) * perPage),
    getRootCategories(plat),
  ]);
  const pages = Math.ceil(total / perPage);
  const catMap = await attachPrimaryCategory(items);

  const href = (over: { q?: string; cat?: string; sort?: string; page?: number }) => {
    const p = new URLSearchParams();
    const nq = over.q ?? q;
    const ncat = over.cat ?? cat;
    const nsort = over.sort ?? sort;
    if (nq) p.set("q", nq);
    if (ncat) p.set("cat", ncat);
    if (nsort !== "newest") p.set("sort", nsort);
    if (plat !== "android") p.set("platform", plat);
    if (over.page && over.page > 1) p.set("page", String(over.page));
    const s = p.toString();
    return s ? `/search?${s}` : "/search";
  };

  const pill = (active: boolean) =>
    `rounded-full px-3.5 py-2 text-[13px] font-bold border transition-colors min-h-[38px] inline-flex items-center ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card border-border text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="animate-fade-up">
      <BackLink href={plat === "android" ? "/" : `/?platform=${plat}`} label={d.backStore} />
      <ViewHead title={d.advSearch} sub={d.advSearchSub} />

      {/* کادر جستجو — همان فرم GET تا با لینک و رفرش هم کار کند */}
      <form action="/search" method="get" className="fx-current bg-card border border-border rounded-2xl p-[7px] shadow-[0_12px_32px_rgba(0,0,0,0.35)] mb-5">
        <div className="flex items-center gap-2 bg-input border border-border rounded-xl ps-[15px] pe-[7px] py-[7px]">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={d.searchPh}
            aria-label={d.advSearch}
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-foreground text-[15px] py-1.5 placeholder:text-muted-foreground"
          />
          {cat && <input type="hidden" name="cat" value={cat} />}
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          {plat !== "android" && <input type="hidden" name="platform" value={plat} />}
          <button
            type="submit"
            aria-label={d.advSearch}
            className="w-10 h-10 shrink-0 grid place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-[0_0_14px_var(--primary)]"
          >
            <Search className="w-[19px] h-[19px]" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* فیلتر دسته */}
      <div className="flex flex-wrap gap-2 mb-3.5" role="group" aria-label={d.cats}>
        <Link href={href({ cat: "", page: 1 })} className={pill(!cat)} aria-pressed={!cat}>{d.allCats}</Link>
        {roots.map((c) => (
          <Link key={c.id} href={href({ cat: c.slug, page: 1 })} className={pill(cat === c.slug)} aria-pressed={cat === c.slug}>
            {catName(c, locale)}
          </Link>
        ))}
      </div>

      {/* مرتب‌سازی */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="text-muted-foreground text-[12.5px] font-bold">{d.sortBy}</span>
        <div className="inline-flex bg-card border border-border rounded-full p-1 gap-0.5" role="group" aria-label={d.sortBy}>
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={href({ sort: s.key, page: 1 })}
              aria-pressed={sort === s.key}
              className={`px-3.5 py-[7px] rounded-full text-[12.5px] transition-colors ${
                sort === s.key ? "bg-primary text-primary-foreground font-extrabold" : "text-muted-foreground font-medium"
              }`}
            >
              {locale === "fa" ? s.fa : s.en}
            </Link>
          ))}
        </div>
        {hasFilters && (
          <Link href={href({ q: "", cat: "", sort: "newest", page: 1 })} className={`${clearBtnClass()} ms-auto`}>
            {d.clearFilters}
          </Link>
        )}
      </div>

      <p className="text-muted-foreground text-[13px] font-bold mx-0.5 mt-4 mb-2">
        {num(total, locale)} {d.results}
      </p>

      {items.length ? (
        <>
          <div className="border-t border-border">
            {items.map((a, i) => {
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
          {pages > 1 && (
            <nav className="flex justify-center gap-1.5 mt-8" aria-label="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={href({ page: p })}
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
        </>
      ) : (
        <EmptyState
          icon={<Search className="w-6 h-6" aria-hidden="true" />}
          text={d.emptySearch}
          action={
            <Link href={href({ q: "", cat: "", sort: "newest", page: 1 })} className={clearBtnClass()}>
              {d.clearFilters}
            </Link>
          }
        />
      )}
    </div>
  );
}

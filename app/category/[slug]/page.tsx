import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryApps, getCategoryBySlug, getChildPreviews, attachPrimaryCategory, type Platform } from "@/lib/store";
import AppRow from "@/components/AppRow";
import { BackLink, ViewHead, EmptyState } from "@/components/Bits";
import { Inbox } from "lucide-react";
import { getLocale } from "@/lib/i18n-server";
import { STR, catName, num, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string; page?: string; platform?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  if (!data) return { title: "یافت نشد" };
  return {
    title: data.nameFa,
    description: `دانلود بهترین برنامه‌های ${data.nameFa}`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = sp.sort === "popular" || sp.sort === "name" ? sp.sort : "updated";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const perPage = 40;
  const plat: Platform = sp.platform === "windows" || sp.platform === "linux" ? sp.platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const qs = plat === "android" ? "" : `?platform=${plat}`;

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  // دسته‌ی والد: برای هر زیردسته یک بخش با چند ردیف ادیتوریال و «مشاهده همه»
  const previews = cat.children.length ? await getChildPreviews(cat.id, 6, plat) : [];
  const data = !previews.length ? await getCategoryApps(slug, perPage, (page - 1) * perPage, sort, plat) : null;
  const items = data?.items ?? [];
  const total = data?.total ?? previews.reduce((sum, p) => sum + p.total, 0);
  const pages = Math.ceil(total / perPage);
  const catMap = await attachPrimaryCategory(items);

  return (
    <div className="animate-fade-up">
      <BackLink href={`/categories${qs}`} label={d.backToCats} />
      <ViewHead title={catName(cat, locale)} sub={`${num(total, locale)} ${locale === "fa" ? "برنامه" : "apps"}`} />

      {previews.length > 0 ? (
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
                {apps.map((a: any, i: number) => (
                  <AppRow key={a.id} app={a} locale={locale} platform={plat} index={i} categoryName={catName(ch, locale)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : items.length ? (
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
                  categoryName={c ? catName(c, locale) : catName(cat, locale)}
                />
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
        </>
      ) : (
        <EmptyState icon={<Inbox className="w-6 h-6" aria-hidden="true" />} text={d.emptyCat} />
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryApps, getCategoryBySlug, getChildPreviews, type Platform } from "@/lib/store";
import AppTile from "@/components/AppTile";
import { toFaDigits } from "@/lib/fa";
import DbIcon from "@/components/DbIcon";
import { Inbox } from "lucide-react";


type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string; page?: string; platform?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryApps(slug, 1);
  if (!data) return { title: "یافت نشد" };
  return {
    title: data.category.nameFa,
    description: `دانلود بهترین برنامه‌های ${data.category.nameFa} برای اندروید`,
    alternates: { canonical: `/category/${slug}` },
  };
}

const SORTS = [
  ["updated", "آخرین به‌روزرسانی"],
  ["popular", "محبوب‌ترین"],
  ["name", "نام"],
] as const;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = (sp.sort === "popular" || sp.sort === "name") ? sp.sort : "updated";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const perPage = 24;
  // ایزولاسیون پلتفرم: دسته فقط برنامه‌های پلتفرم فعلی را نشان می‌دهد
  const plat: Platform = (sp.platform === "windows" || sp.platform === "linux") ? sp.platform : "android";
  const platParam = plat === "android" ? "" : `?platform=${plat}`;
  const platQs = plat === "android" ? "" : `&platform=${plat}`;

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  // دسته‌ی والد: نمایش ریل افقی هر زیردسته (به سبک اپ‌استورها)
  const previews = cat.children.length ? await getChildPreviews(cat.id, 10, plat) : [];

  const data = !previews.length ? await getCategoryApps(slug, perPage, (page - 1) * perPage, sort, plat) : null;
  const items = data?.items ?? [];
  const total = data?.total ?? previews.reduce((s, p) => s + p.total, 0);
  const pages = Math.ceil(total / perPage);

  return (
    <div className="animate-fade-up">
      {/* سربرگ */}
      <section className="rounded-lg overflow-hidden border border-border bg-surface mb-8" aria-label={cat.nameFa}>
        <div className="p-6 sm:p-8 flex items-center gap-5">
          <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <DbIcon icon={cat.icon} className="w-9 h-9 sm:w-11 sm:h-11" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{cat.nameFa}</h1>
            <p className="text-sm text-muted mt-1"><span className="font-mono" dir="ltr">{total.toLocaleString("en-US")}</span> برنامه</p>
            {cat.description && <p className="text-sm text-muted mt-2 leading-7 max-w-2xl">{cat.description}</p>}
          </div>
        </div>
      </section>

      {previews.length > 0 ? (
        /* ریل زیردسته‌ها */
        <div className="space-y-10">
          {previews.map(({ category: ch, apps, total: t }) => (
            <section key={ch.id} aria-label={ch.nameFa}>
              <div className="flex items-center justify-between mb-4">
                <Link href={`/category/${ch.slug}${platParam}`} className="flex items-center gap-2 group">
                  <DbIcon icon={ch.icon} className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-extrabold group-hover:text-primary transition">{ch.nameFa}</h2>
                  <span className="font-mono text-[11px] text-muted" dir="ltr">({t.toLocaleString("en-US")})</span>
                </Link>
                {t > apps.length && (
                  <Link href={`/category/${ch.slug}${platParam}`} className="text-sm text-primary font-bold hover:underline shrink-0">
                    مشاهده همه ←
                  </Link>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x scrollbar-none">
                {apps.map((a: any, i: number) => (
                  <div key={a.id} className="w-28 sm:w-32 shrink-0 snap-start">
                    <AppTile app={a} index={i} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* دسته‌ی بدون زیردسته: گرید + مرتب‌سازی + صفحه‌بندی */
        <>
          <div className="flex gap-2 mb-6" role="group" aria-label="مرتب‌سازی">
            {SORTS.map(([key, label]) => (
              <Link key={key} href={`/category/${slug}?sort=${key}${platQs}`}
                className={`text-sm px-4 py-2 rounded-lg border transition ${sort === key
                  ? "bg-primary-soft text-primary border-primary/50 font-bold"
                  : "bg-surface border-border hover:border-primary/50"}`}>
                {label}
              </Link>
            ))}
          </div>

          {items.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {items.map((a, i) => <AppTile key={a.id} app={a} index={i} />)}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-lg p-10 text-center">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-muted" aria-hidden="true" />
              <p className="font-bold mb-1">برنامه‌ای در این دسته ثبت نشده است</p>
              <p className="text-sm text-muted">به‌زودی برنامه‌های جدید اضافه می‌شود.</p>
            </div>
          )}

          {pages > 1 && (
            <nav className="flex justify-center mt-8" aria-label="صفحه‌بندی">
              <div className="join">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/category/${slug}?sort=${sort}&page=${p}${platQs}`}
                    aria-current={p === page ? "page" : undefined}
                    className={`join-item btn ${p === page ? "btn-primary btn-active" : "btn-ghost"}`}>
                    {toFaDigits(p)}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

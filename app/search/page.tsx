import Link from "next/link";
import { searchApps, getAllCategories, type Platform } from "@/lib/store";
import SearchCategoryFilter from "@/components/SearchCategoryFilter";
import AppCard from "@/components/AppCard";
import { toFaDigits } from "@/lib/fa";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";


type Props = { searchParams: Promise<{ q?: string; sort?: string; oss?: string; page?: string; platform?: string; cat?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q || "";
  return { title: q ? `جست‌وجو: ${q}` : "جست‌وجو", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const sort = (sp.sort === "popular" || sp.sort === "newest" || sp.sort === "name") ? sp.sort : "updated";
  const oss = sp.oss === "1";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const perPage = 24;
  // ایزولاسیون پلتفرم: جست‌وجو فقط در پلتفرم فعلی
  const plat: Platform = (sp.platform === "windows" || sp.platform === "linux") ? sp.platform : "android";
  const platQs = plat === "android" ? "" : `&platform=${plat}`;
  const cat = sp.cat || "";
  const catQs = cat ? `&cat=${encodeURIComponent(cat)}` : "";

  const [{ items, total }, cats] = q
    ? await Promise.all([
        searchApps(q, { sort, openSource: oss || undefined, platform: plat, category: cat || undefined }, perPage, (page - 1) * perPage),
        getAllCategories(),
      ])
    : [{ items: [], total: 0 }, []];
  const pages = Math.ceil(total / perPage);
  const base = `/search?q=${encodeURIComponent(q)}&sort=${sort}${oss ? "&oss=1" : ""}${platQs}`;

  return (
    <div className="animate-fade-up">
      <span className="block font-mono text-[10.5px] text-primary mb-1" dir="ltr" style={{ textAlign: "right" }}>{"// search"}</span>
      <h1 className="text-2xl font-extrabold mb-1">
        {q ? <>نتایج جست‌وجو برای «{q}»</> : "جست‌وجو"}
      </h1>
      <p className="text-sm text-muted mb-6">{q ? <><span className="font-mono" dir="ltr">{total.toLocaleString("en-US")}</span> نتیجه</> : "عبارتی را در کادر جست‌وجوی بالا وارد کنید."}</p>

      {q && (
        <div className="flex flex-wrap gap-2 mb-6">
          {([["updated", "مرتبط‌ترین"], ["popular", "محبوب‌ترین"], ["newest", "جدیدترین"], ["name", "نام"]] as const).map(([k, label]) => (
            <Link key={k} href={`/search?q=${encodeURIComponent(q)}&sort=${k}${oss ? "&oss=1" : ""}${platQs}${catQs}`}
              className={`text-sm px-4 py-2 rounded-lg border transition ${sort === k
                ? "bg-primary-soft text-primary border-primary/50 font-bold" : "bg-surface border-border hover:border-primary/50"}`}>
              {label}
            </Link>
          ))}
          <Link href={`/search?q=${encodeURIComponent(q)}&sort=${sort}${oss ? "" : "&oss=1"}${platQs}${catQs}`}
            className={`text-sm px-4 py-2 rounded-lg border transition ${oss
              ? "bg-primary-soft text-primary border-primary/50 font-bold" : "bg-surface border-border hover:border-primary/50"}`}>
            فقط متن‌باز
          </Link>
          <SearchCategoryFilter cats={cats.map((c: any) => ({ slug: c.slug, nameFa: c.nameFa }))} current={cat} base={base} />
        </div>
      )}

      {q && (items.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
          {items.map((a, i) => <AppCard key={a.id} app={a} index={i} variant="horizontal" />)}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg p-10 text-center">
          <SearchX className="w-10 h-10 mx-auto mb-3 text-muted" aria-hidden="true" />
          <p className="font-bold mb-1">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted">املای عبارت را بررسی کنید یا از کلمات ساده‌تر استفاده کنید.</p>
        </div>
      ))}

      {pages > 1 && (
        <nav className="flex justify-center mt-8" aria-label="صفحه‌بندی">
          <div className="join">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={`${base}${catQs}&page=${p}`} aria-current={p === page ? "page" : undefined}
                className={`join-item btn ${p === page ? "btn-primary btn-active" : "btn-ghost"}`}>
                {toFaDigits(p)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import { HomeCatalog } from "@/components/CachedCatalog";
import { getLocale } from "@/lib/i18n-server";
import { STR, type Locale } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

type Props = { searchParams: Promise<{ platform?: string; page?: string }> };

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
  const { platform, page } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
  const locale = await getLocale();
  const d = STR[locale];
  const qs = platQs(plat);

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

        {/* بلوک برگزیده + فهرست — با کشِ رندر (۲۴ ردیف در هر صفحه) */}
        <HomeCatalog plat={plat} locale={locale} page={pageNum} />
      </section>
    </div>
  );
}

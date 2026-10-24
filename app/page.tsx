import Link from "next/link";
import PxImg from "@/components/PxImg";
import { Suspense } from "react";
import PopularRow from "@/components/PopularRow";
import NewBadge from "@/components/NewBadge";
import AppCard from "@/components/AppCard";
import Section from "@/components/Section";
import DbIcon from "@/components/DbIcon";
import WeeklyPicks from "@/components/WeeklyPicks";
import TopInRail from "@/components/TopInRail";
import HeroSearch from "@/components/HeroSearch";
import { ChevronLeft, LayoutGrid, Download, Tags } from "lucide-react";
import {
  getRootCategories, getPopularApps,
  getLatestApps, getCategoryBySlug, getChildPreviews, getHomeStats,
  getEditorChoice, getCategoryApps,
} from "@/lib/store";
import { toFaDigits } from "@/lib/fa";
import { px } from "@/lib/img";
import type { Platform } from "@/lib/store";

type Props = { searchParams: Promise<{ cat?: string; platform?: string }> };

function appHref(slug: string, platform?: Platform) {
  return platform && platform !== "android" ? `/app/${slug}?platform=${platform}` : `/app/${slug}`;
}

async function HomeSlide({ platform }: { platform?: Platform }) {
  const cats = await getRootCategories(platform);
  const topCats = cats
    .filter((c) => (c.appCount ?? 0) >= 5)
    .sort((a, b) => (b.appCount ?? 0) - (a.appCount ?? 0))
    .slice(0, 4);

  const [popular, latest, stats, weeklyPicks, ...topRails] = await Promise.all([
    getPopularApps(8, platform),
    getLatestApps(8, platform), getHomeStats(platform),
    getEditorChoice(6, platform),
    ...topCats.map((c) => getCategoryApps(c.slug, 8, 0, "popular", platform).then((r) => ({ cat: c, items: r?.items ?? [] }))),
  ]);

  return (
    <>
      {/* پیشنهادهای هفته — ۶ اپ منتخب سردبیر با آیکون کوچک */}
      <WeeklyPicks apps={weeklyPicks} platform={platform} />

      {/* برترین‌های دسته‌ها — ۴ دسته‌ی بزرگ + لینک به همه */}
      {topRails.map(({ cat, items }) =>
        items.length >= 3 ? (
          <TopInRail key={cat.slug} title={`برترین ${cat.nameFa}`} categorySlug={cat.slug} apps={items} platform={platform} />
        ) : null
      )}
      <div className="text-center mb-10">
        <Link
          href={`/top${platform && platform !== "android" ? `?platform=${platform}` : ""}`}
          className="inline-flex items-center gap-1 text-sm text-primary font-bold hover:underline"
        >
          مشاهده‌ی برترین‌های همه‌ی دسته‌ها <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {/* نوار آمار */}
      <div className="grid grid-cols-3 w-full bg-card border border-border rounded-xl shadow-sm mb-10 overflow-hidden" role="status" aria-label="آمار فروشگاه">
        <div className="px-4 py-3">
          <div className="text-primary">
            <LayoutGrid className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="text-[11px] text-muted-foreground">برنامه</div>
          <div className="text-xl font-bold">{toFaDigits(stats.apps)}</div>
        </div>
        <div className="px-4 py-3 border-s border-border">
          <div className="text-secondary">
            <Download className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="text-[11px] text-muted-foreground">دانلود</div>
          <div className="text-xl font-bold">{toFaDigits(stats.downloads)}</div>
        </div>
        <div className="px-4 py-3 border-s border-border">
          <div className="text-warning">
            <Tags className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="text-[11px] text-muted-foreground">دسته‌بندی</div>
          <div className="text-xl font-bold">{toFaDigits(stats.categories)}</div>
        </div>
      </div>

      {/* تازه‌ها — اسکرولر افقی */}
      <Section title="تازه‌ها" href={platform ? `/latest?platform=${platform}` : "/latest"}>
        <div className="flex gap-3.5 overflow-x-auto pb-3 snap-x scrollbar-none">
          {latest.map((a) => (
            <Link key={a.id} href={appHref(a.slug, platform)}
              className="flex-none w-32 sm:w-[150px] snap-start flex flex-col gap-2 group">
              {a.iconUrl ? (
                <PxImg src={px(a.iconUrl) || "/icons/icon-192.png"} alt={`آیکون ${a.nameFa}`} width={130} height={130}
                  className="w-28 h-28 sm:w-[130px] sm:h-[130px] rounded-[28px] object-cover bg-muted" />
              ) : (
                <span className="w-28 h-28 sm:w-[130px] sm:h-[130px] rounded-[28px] bg-muted grid place-items-center text-5xl font-bold text-muted-foreground" dir="ltr">
                  {a.nameEn.charAt(0)}
                </span>
              )}
              <b className="font-bold leading-6 group-hover:text-primary transition truncate flex items-center gap-1.5">
                <span className="truncate">{a.nameFa}</span>
                <NewBadge createdAt={a.createdAt} className="shrink-0" />
              </b>
            </Link>
          ))}
        </div>
      </Section>

      {/* پرطرفدارها — گرید فشرده بدون اسکرول */}
      <Section title="پرطرفدارها" href={platform ? `/popular?platform=${platform}` : "/popular"} empty="هنوز آماری ثبت نشده است.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {popular.map((a, i) => <PopularRow key={a.id} app={a} platform={platform} index={i} />)}
        </div>
      </Section>

    </>
  );
}

async function CategorySlide({ slug, platform }: { slug: string; platform: Platform }) {
  const cat = await getCategoryBySlug(slug);
  if (!cat) return <p className="text-muted-foreground text-center py-10">دسته‌بندی یافت نشد.</p>;
  const previews = await getChildPreviews(cat.id, 10, platform);
  const total = previews.reduce((s, p) => s + p.total, 0);

  return (
    <div className="animate-fade-up" key={slug}>
      <div className="flex items-center gap-4 mb-8">
        <span className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <DbIcon icon={cat.icon} className="w-9 h-9" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">{cat.nameFa}</h1>
          <p className="text-sm text-muted-foreground">{toFaDigits(total)} برنامه</p>
        </div>
      </div>
      {previews.length ? (
        <div className="space-y-10">
          {previews.map(({ category: ch, apps, total: t }) => (
            <section key={ch.id} aria-label={ch.nameFa}>
              <div className="flex items-center justify-between mb-4">
                <Link href={`/category/${ch.slug}${platform === "android" ? "" : `?platform=${platform}`}`} className="flex items-center gap-2 group">
                  <DbIcon icon={ch.icon} className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-extrabold group-hover:text-primary transition">{ch.nameFa}</h2>
                  <span className="text-xs text-muted-foreground">({toFaDigits(t)})</span>
                </Link>
                {t > apps.length && (
                  <Link href={`/category/${ch.slug}${platform === "android" ? "" : `?platform=${platform}`}`} className="text-sm text-primary font-bold hover:underline shrink-0">
                    مشاهده همه ←
                  </Link>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x scrollbar-none">
                {apps.map((a: any, i: number) => (
                  <div key={a.id} className="w-64 sm:w-72 shrink-0 snap-start">
                    <AppCard app={a} index={i} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-10">به‌زودی برنامه‌های جدید اضافه می‌شود.</p>
      )}
    </div>
  );
}

export default async function Home({ searchParams }: Props) {
  const { cat, platform } = await searchParams;
  const plat: Platform = (platform === "windows" || platform === "linux") ? platform : "android";

  return (
    <div>
      {/* ترتیب فروشگاهی: لوگوی کسوف و جستجو ← اپ‌ها (ردیف دسته‌ها و نوار مجموعه‌ها فعلاً حذف شده‌اند) */}
      {!cat && <HeroSearch />}
      {cat ? <CategorySlide slug={cat} platform={plat} /> : <HomeSlide platform={plat} />}
    </div>
  );
}
// rebuild 1792223364

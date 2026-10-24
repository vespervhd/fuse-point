import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getNewestApps, getLatestApps, attachPrimaryCategory, type Platform } from "@/lib/store";
import AppRow from "@/components/AppRow";
import { BackLink, ViewHead, SectionHead, EmptyState } from "@/components/Bits";
import { getLocale } from "@/lib/i18n-server";
import { STR, catName } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: STR[locale].fresh };
}

type Props = { searchParams: Promise<{ platform?: string }> };

// نمای «تازه‌ها» — جدیدترین‌های اضافه‌شده + آخرین به‌روزرسانی‌ها، در فضای پلتفرم فعال
export default async function FreshPage({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const qs = plat === "android" ? "" : `?platform=${plat}`;

  const [newest, updated] = await Promise.all([
    getNewestApps(24, plat),
    getLatestApps(24, plat),
  ]);
  const [newCatMap, updCatMap] = await Promise.all([
    attachPrimaryCategory(newest),
    attachPrimaryCategory(updated),
  ]);

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead title={d.fresh} sub={d.freshSub} />

      <section aria-label={d.freshNew}>
        <SectionHead title={d.freshNew} locale={locale} />
        {newest.length ? (
          <div className="border-t border-border">
            {newest.map((a, i) => {
              const c = newCatMap.get(a.id);
              return (
                <AppRow key={a.id} app={a} locale={locale} platform={plat} index={i} categoryName={c ? catName(c, locale) : null} />
              );
            })}
          </div>
        ) : (
          <EmptyState icon={<Sparkles className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
        )}
      </section>

      <section className="mt-12" aria-label={d.freshUpd}>
        <SectionHead title={d.freshUpd} locale={locale} />
        {updated.length ? (
          <div className="border-t border-border">
            {updated.map((a, i) => {
              const c = updCatMap.get(a.id);
              return (
                <AppRow key={a.id} app={a} locale={locale} platform={plat} index={i} categoryName={c ? catName(c, locale) : null} />
              );
            })}
          </div>
        ) : (
          <EmptyState icon={<Sparkles className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
        )}
      </section>
    </div>
  );
}

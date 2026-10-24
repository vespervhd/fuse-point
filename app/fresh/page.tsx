import type { Metadata } from "next";
import { FreshLists } from "@/components/CachedCatalog";
import { BackLink, ViewHead } from "@/components/Bits";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

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

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead title={d.fresh} sub={d.freshSub} />
      <FreshLists plat={plat} locale={locale} />
    </div>
  );
}

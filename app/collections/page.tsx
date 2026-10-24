import type { Metadata } from "next";
import { CollectionsGrid } from "@/components/CachedCatalog";
import { BackLink, ViewHead } from "@/components/Bits";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: STR[locale].cols,
    description: locale === "fa"
      ? "لیست‌های دست‌چین برنامه‌ها در Fuse Point"
      : "Hand-picked app lists on Fuse Point",
  };
}

type Props = { searchParams: Promise<{ platform?: string }> };

// نمای مجموعه‌ها — ردیف‌های تمام‌عرض با شمار واقعی همین پلتفرم (عین نمونه)
export default async function CollectionsPage({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const qs = plat === "android" ? "" : `?platform=${plat}`;

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead title={d.colsTitle} sub={d.colsSub} />
      <CollectionsGrid plat={plat} locale={locale} />
    </div>
  );
}

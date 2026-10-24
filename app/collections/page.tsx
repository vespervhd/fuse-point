import Link from "next/link";
import type { Metadata } from "next";
import { getCollections, type Platform } from "@/lib/store";
import DbIcon from "@/components/DbIcon";
import { BackLink, ViewHead, EmptyState } from "@/components/Bits";
import { ChevronLeft, Layers } from "lucide-react";
import { getLocale } from "@/lib/i18n-server";
import { STR, appsCount } from "@/lib/i18n";

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
  const collections = await getCollections(plat);
  const qs = plat === "android" ? "" : `?platform=${plat}`;

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead title={d.colsTitle} sub={d.colsSub} />
      {collections.length ? (
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
      ) : (
        <EmptyState icon={<Layers className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
      )}
    </div>
  );
}

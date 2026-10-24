import Link from "next/link";
import { getRootCategories, type Platform } from "@/lib/store";
import DbIcon from "@/components/DbIcon";
import { BackLink, ViewHead, EmptyState } from "@/components/Bits";
import { LayoutGrid } from "lucide-react";
import { getLocale } from "@/lib/i18n-server";
import { STR, catName, appsCount } from "@/lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  return { title: STR[locale].cats };
}

type Props = { searchParams: Promise<{ platform?: string }> };

// نمای دسته‌بندی‌ها — گرید دوسطونه‌ی کاشی آیکنی با شمار واقعی همین پلتفرم (عین نمونه)
export default async function CategoriesPage({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const cats = await getRootCategories(plat);
  const qs = plat === "android" ? "" : `?platform=${plat}`;

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead title={d.cats} sub={d.catsSub} />
      {cats.length ? (
        <div className="grid grid-cols-2 gap-[11px]">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}${qs}`}
              className="flex flex-col items-start gap-2.5 bg-card border border-border rounded-[18px] p-[18px] shadow-sm hover:border-primary/60 transition-colors"
            >
              <span className="w-[46px] h-[46px] rounded-[13px] grid place-items-center text-primary bg-primary/10 border border-primary/[0.22]">
                <DbIcon icon={c.icon} className="w-[23px] h-[23px]" />
              </span>
              <span className="text-[15px] font-extrabold leading-[1.7]">{catName(c, locale)}</span>
              <span className="text-muted-foreground text-xs">{appsCount(c.appCount, locale)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={<LayoutGrid className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
      )}
    </div>
  );
}

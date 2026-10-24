import { CategoriesGrid } from "@/components/CachedCatalog";
import { BackLink, ViewHead } from "@/components/Bits";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

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
  const qs = plat === "android" ? "" : `?platform=${plat}`;

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead title={d.cats} sub={d.catsSub} />
      <CategoriesGrid plat={plat} locale={locale} />
    </div>
  );
}

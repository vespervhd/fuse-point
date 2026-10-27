import HomeSearch from "@/components/HomeSearch";
import { HomeShop } from "@/components/HomeShop";
import { getLocale } from "@/lib/i18n-server";
import type { Platform } from "@/lib/store";

type Props = { searchParams: Promise<{ platform?: string; page?: string }> };

// Homepage — shop layout (approved sample v4): search, category chips,
// featured card, 2-column product grid. Thin shell; the body is cached.
export default async function Home({ searchParams }: Props) {
  const { platform, page } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
  const locale = await getLocale();

  return (
    <div>
      <HomeSearch locale={locale} plat={plat} />
      <HomeShop plat={plat} locale={locale} page={pageNum} />
    </div>
  );
}

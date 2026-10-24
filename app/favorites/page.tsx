import FavoritesPage from "./FavoritesPage";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

export async function generateMetadata() {
  const locale = await getLocale();
  return { title: STR[locale].favs, robots: { index: false } };
}

type Props = { searchParams: Promise<{ platform?: string }> };

export default async function Page({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale = await getLocale();
  return <FavoritesPage locale={locale} platform={plat} />;
}

import type { Metadata } from "next";
import { getPopularApps } from "@/lib/store";
import AppGrid from "@/components/AppGrid";
import type { Platform } from "@/lib/store";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = STR[locale];
  return { title: d.ext_popular, description: d.ext_popularMetaDesc };
}

type Props = { searchParams: Promise<{ platform?: string }> };

export default async function PopularPage({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = (platform === "windows" || platform === "linux") ? platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const apps = await getPopularApps(48, plat);
  return <AppGrid title={d.ext_popular} subtitle={d.ext_popularSub} apps={apps} locale={locale} />;
}

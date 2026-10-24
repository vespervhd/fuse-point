import type { Metadata } from "next";
import { getLatestApps } from "@/lib/store";
import AppGrid from "@/components/AppGrid";
import type { Platform } from "@/lib/store";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = STR[locale];
  return { title: d.ext_latest, description: d.ext_latestMetaDesc };
}

type Props = { searchParams: Promise<{ platform?: string }> };

export default async function LatestPage({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = (platform === "windows" || platform === "linux") ? platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const apps = await getLatestApps(48, plat);
  return <AppGrid title={d.ext_latest} subtitle={d.ext_latestSub} apps={apps} locale={locale} />;
}

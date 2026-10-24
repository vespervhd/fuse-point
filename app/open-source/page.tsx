import type { Metadata } from "next";
import { getOpenSourceApps } from "@/lib/store";
import AppGrid from "@/components/AppGrid";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = STR[locale];
  return { title: d.ext_openSource, description: d.ext_openSourceMetaDesc };
}

export default async function OpenSourcePage() {
  const locale = await getLocale();
  const d = STR[locale];
  const apps = await getOpenSourceApps(48);
  return <AppGrid title={`🆓 ${d.ext_openSource}`} subtitle={d.ext_openSourceSub} apps={apps} locale={locale} />;
}

import AppsList from "./AppsList";
import { getLocale } from "@/lib/i18n-server";

export default async function AdminAppsPage() {
  const locale = await getLocale();
  return <AppsList locale={locale} />;
}

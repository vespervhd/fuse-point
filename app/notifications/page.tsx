import NotificationsPage from "./NotificationsPage";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  return { title: STR[locale].notifications };
}

export default async function Page() {
  const locale = await getLocale();
  return <NotificationsPage locale={locale} />;
}

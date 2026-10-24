import NotificationsPage from "./NotificationsPage";
import { getLocale } from "@/lib/i18n-server";

export const metadata = { title: "اعلان‌ها" };

export default async function Page() {
  const locale = await getLocale();
  return <NotificationsPage locale={locale} />;
}

import EditApp from "./EditApp";
import { getLocale } from "@/lib/i18n-server";

export default async function AdminEditAppPage() {
  const locale = await getLocale();
  return <EditApp locale={locale} />;
}

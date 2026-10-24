import ReportsAdmin from "./ReportsAdmin";
import { getLocale } from "@/lib/i18n-server";

export default async function AdminReportsPage() {
  const locale = await getLocale();
  return <ReportsAdmin locale={locale} />;
}

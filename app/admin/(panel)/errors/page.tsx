import ErrorsAdmin from "./ErrorsAdmin";
import { getLocale } from "@/lib/i18n-server";

export default async function AdminErrorsPage() {
  const locale = await getLocale();
  return <ErrorsAdmin locale={locale} />;
}

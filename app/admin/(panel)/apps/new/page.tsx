import NewAppForm from "./NewAppForm";
import { getLocale } from "@/lib/i18n-server";

export default async function NewAppPage() {
  const locale = await getLocale();
  return <NewAppForm locale={locale} />;
}

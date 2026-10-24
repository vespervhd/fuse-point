import CategoriesAdmin from "./CategoriesAdmin";
import { getLocale } from "@/lib/i18n-server";

export default async function AdminCategoriesPage() {
  const locale = await getLocale();
  return <CategoriesAdmin locale={locale} />;
}

import ReviewsAdmin from "./ReviewsAdmin";
import { getLocale } from "@/lib/i18n-server";

export default async function AdminReviewsPage() {
  const locale = await getLocale();
  return <ReviewsAdmin locale={locale} />;
}

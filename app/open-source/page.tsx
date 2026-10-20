import { getOpenSourceApps } from "@/lib/store";
import { connection } from "next/server";
import AppGrid from "@/components/AppGrid";

export const metadata = { title: "نرم‌افزارهای متن‌باز", description: "فهرست نرم‌افزارهای آزاد و متن‌باز اندروید" };

export default async function OpenSourcePage() {
  // داده‌ی کاتالوگ موقع بیلد پخته نمی‌شود؛ رندر زمان درخواست است و از کش خوانده
  // می‌شود (همان رفتار قبل از کش‌شدن store — آن‌جا connection() داخل توابع بود).
  await connection();
  const apps = await getOpenSourceApps(48);
  return <AppGrid title="🆓 نرم‌افزارهای متن‌باز" subtitle="برنامه‌های آزاد با کد منبع در دسترس" apps={apps} />;
}

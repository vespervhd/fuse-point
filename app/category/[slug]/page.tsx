import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryBody } from "@/components/CachedCatalog";
import { getCategoryBySlugCore, type Platform } from "@/lib/store";
import { getLocale } from "@/lib/i18n-server";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string; page?: string; platform?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryBySlugCore(slug);
  if (!data) return { title: "یافت نشد" };
  return {
    title: data.nameFa,
    description: `دانلود بهترین برنامه‌های ${data.nameFa}`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = sp.sort === "popular" || sp.sort === "name" ? sp.sort : "updated";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const plat: Platform = sp.platform === "windows" || sp.platform === "linux" ? sp.platform : "android";
  const locale = await getLocale();

  // بررسی وجود دسته در پوسته (بدنه‌ی کش‌شده نمی‌تواند notFound بدهد)
  const cat = await getCategoryBySlugCore(slug);
  if (!cat) notFound();

  return <CategoryBody slug={slug} sort={sort} page={page} plat={plat} locale={locale} />;
}

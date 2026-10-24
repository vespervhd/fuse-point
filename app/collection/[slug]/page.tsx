import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CollectionBody } from "@/components/CachedCatalog";
import { getCollectionMetaCore, type Platform } from "@/lib/store";
import { getLocale } from "@/lib/i18n-server";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ platform?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollectionMetaCore(slug);
  if (!col) return { title: "یافت نشد" };
  return { title: col.nameFa, description: col.description || `مجموعه‌ی ${col.nameFa} در Fuse Point` };
}

// صفحه‌ی یک مجموعه — ردیف‌های ادیتوریال برنامه‌های مجموعه در فضای پلتفرم فعال
export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale = await getLocale();

  // بررسی وجود مجموعه در پوسته (بدنه‌ی کش‌شده نمی‌تواند notFound بدهد)
  const meta = await getCollectionMetaCore(slug);
  if (!meta) notFound();

  return <CollectionBody slug={slug} plat={plat} locale={locale} />;
}

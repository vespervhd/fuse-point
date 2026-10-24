import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionBySlug, attachPrimaryCategory, type Platform } from "@/lib/store";
import AppRow from "@/components/AppRow";
import { BackLink, ViewHead, EmptyState } from "@/components/Bits";
import { Layers } from "lucide-react";
import { getLocale } from "@/lib/i18n-server";
import { STR, catName, num } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ platform?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);
  if (!col) return { title: "یافت نشد" };
  return { title: col.nameFa, description: col.description || `مجموعه‌ی ${col.nameFa} در Fuse Point` };
}

// صفحه‌ی یک مجموعه — ردیف‌های ادیتوریال برنامه‌های مجموعه در فضای پلتفرم فعال
export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const col = await getCollectionBySlug(slug, plat);
  if (!col) notFound();
  const catMap = await attachPrimaryCategory(col.apps as any[]);
  const qs = plat === "android" ? "" : `?platform=${plat}`;

  return (
    <div className="animate-fade-up">
      <BackLink href={`/collections${qs}`} label={d.backCols} />
      <ViewHead
        title={col.nameFa}
        sub={col.description || `${num(col.apps.length, locale)} ${locale === "fa" ? "برنامه" : "apps"}`}
      />
      {col.apps.length ? (
        <div className="border-t border-border">
          {col.apps.map((a: any, i: number) => {
            const c = catMap.get(a.id);
            return (
              <AppRow
                key={a.id}
                app={a}
                locale={locale}
                platform={plat}
                index={i}
                categoryName={c ? catName(c, locale) : null}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Layers className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
      )}
    </div>
  );
}

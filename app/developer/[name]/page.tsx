import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Globe, Code2 } from "lucide-react";
import { getDeveloperPage, attachPrimaryCategory, type Platform } from "@/lib/store";
import AppRow from "@/components/AppRow";
import { BackLink, ViewHead, EmptyState } from "@/components/Bits";
import { getLocale } from "@/lib/i18n-server";
import { STR, catName, num } from "@/lib/i18n";

type Props = { params: Promise<{ name: string }>; searchParams: Promise<{ platform?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const data = await getDeveloperPage(decodeURIComponent(name));
  if (!data) return { title: "یافت نشد" };
  return { title: data.developer.name, description: `برنامه‌های ${data.developer.name} در Fuse Point` };
}

// صفحه‌ی توسعه‌دهنده — همه‌ی برنامه‌های او؛ نمایش در فضای پلتفرم فعال
export default async function DeveloperPage({ params, searchParams }: Props) {
  const { name } = await params;
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale = await getLocale();
  const d = STR[locale];
  const data = await getDeveloperPage(decodeURIComponent(name));
  if (!data) notFound();
  const { developer, apps } = data;
  const shown = apps.filter((a: any) => a.platform === plat);
  const catMap = await attachPrimaryCategory(shown as any[]);
  const qs = plat === "android" ? "" : `?platform=${plat}`;

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead
        title={developer.name}
        sub={`${d.developer} · ${num(shown.length, locale)} ${locale === "fa" ? "برنامه در این پلتفرم" : "apps on this platform"}`}
      />
      {developer.website && (
        <div className="flex flex-wrap gap-2 mb-6 -mt-2">
          <a href={developer.website} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold border border-border bg-card rounded-full px-3.5 py-2 hover:text-primary">
            <Globe className="w-4 h-4" aria-hidden="true" /> {locale === "fa" ? "وب‌سایت" : "Website"}
          </a>
        </div>
      )}
      {shown.length ? (
        <div className="border-t border-border">
          {shown.map((a: any, i: number) => {
            const c = catMap.get(a.id);
            return (
              <AppRow key={a.id} app={a} locale={locale} platform={plat} index={i} categoryName={c ? catName(c, locale) : null} />
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Code2 className="w-6 h-6" aria-hidden="true" />} text={d.emptyHome} sub={d.tryAnotherPlatform} />
      )}
    </div>
  );
}

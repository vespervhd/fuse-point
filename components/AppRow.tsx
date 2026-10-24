import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import { px } from "@/lib/img";
import { appName, platName, type Locale } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

export type RowApp = {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  iconUrl: string | null;
  platform?: string | null;
};

// چیپ پلتفرم: نقطه‌ی رنگی ثابت + نام پلتفرم فعال
export function PlatformChip({ platform, locale }: { platform: string; locale: Locale }) {
  return (
    <span className="inline-flex items-center gap-[5px] text-[11px] text-muted-foreground border border-border rounded-full px-2 py-[2.5px] whitespace-nowrap">
      <span className={`pdot p-${platform}`} aria-hidden="true" />
      {platName(locale, platform)}
    </span>
  );
}

// ردیف فشرده‌ی فهرست — عین نمونه ولی خیلی جمع‌وجورتر: آیکن ۳۴px، پدینگ عمودی نصف‌شده
// دکمه‌ی نشان (بوکمارک) عمداً از ردیف‌ها حذف شده؛ علاقه‌مندی فقط در خود صفحه‌ی برنامه است
export default function AppRow({
  app, locale, categoryName, platform, index = 0,
}: {
  app: RowApp;
  locale: Locale;
  categoryName?: string | null;
  platform: Platform | string;
  index?: number;
}) {
  const name = appName(app, locale);
  const href = `/app/${app.slug}`;
  return (
    <div
      className="fx-reveal group relative flex items-center gap-2.5 min-h-[56px] py-[7px] px-2 border-b border-border hover:bg-card/60 transition-colors"
      style={{ animationDelay: `${(index % 6) * 55}ms` }}
    >
      <Link href={href} className="absolute inset-0" aria-label={name} />
      <span className="w-[34px] h-[34px] rounded-lg grid place-items-center overflow-hidden shrink-0 bg-primary/[0.13] border border-primary/25 text-primary">
        <AppIcon src={app.iconUrl ? px(app.iconUrl, "icon") || app.iconUrl : null} name={app.nameEn || name} width={34} height={34} imgClassName="w-full h-full object-cover" letterClassName="text-base font-bold" />
      </span>
      <span className="flex-1 min-w-0 pointer-events-none">
        <span className="block text-[14px] font-bold truncate leading-5" dir="auto">{name}</span>
        <span className="flex items-center flex-wrap gap-1.5 mt-[3px]">
          {categoryName && <span className="text-xs text-muted-foreground">{categoryName}</span>}
          <PlatformChip platform={String(platform)} locale={locale} />
        </span>
      </span>
      <span className="flip-x text-muted-foreground grid place-items-center shrink-0" aria-hidden="true">
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
      </span>
    </div>
  );
}

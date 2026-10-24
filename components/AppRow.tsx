import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PxImg from "@/components/PxImg";
import RowBookmark from "@/components/RowBookmark";
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

// ردیف ادیتوریال فهرست — عین نمونه: آیکن ۴۶px، نام، خط دسته، چیپ پلتفرم، چورون، جداکننده‌ی مویی
export default function AppRow({
  app, locale, categoryName, platform, index = 0, bookmark = true,
}: {
  app: RowApp;
  locale: Locale;
  categoryName?: string | null;
  platform: Platform | string;
  index?: number;
  bookmark?: boolean;
}) {
  const name = appName(app, locale);
  const href = `/app/${app.slug}`;
  return (
    <div
      className="fx-reveal group relative flex items-center gap-[13px] min-h-[76px] py-[13px] px-2 border-b border-border hover:bg-card/60 transition-colors"
      style={{ animationDelay: `${(index % 6) * 55}ms` }}
    >
      <Link href={href} className="absolute inset-0" aria-label={name} />
      <span className="w-[46px] h-[46px] rounded-xl grid place-items-center overflow-hidden shrink-0 bg-primary/[0.13] border border-primary/25 text-primary">
        {app.iconUrl ? (
          <PxImg src={px(app.iconUrl) || app.iconUrl} alt="" width={46} height={46} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-bold" dir="ltr">{(app.nameEn || name || "?").charAt(0)}</span>
        )}
      </span>
      <span className="flex-1 min-w-0 pointer-events-none">
        <span className="block text-[15px] font-bold truncate leading-6" dir="auto">{name}</span>
        <span className="flex items-center flex-wrap gap-1.5 mt-[5px]">
          {categoryName && <span className="text-xs text-muted-foreground">{categoryName}</span>}
          <PlatformChip platform={String(platform)} locale={locale} />
        </span>
      </span>
      {bookmark && (
        <span className="relative z-[1]">
          <RowBookmark appId={app.id} slug={app.slug} locale={locale} />
        </span>
      )}
      <span className="flip-x text-muted-foreground grid place-items-center shrink-0" aria-hidden="true">
        <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
      </span>
    </div>
  );
}

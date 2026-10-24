import Link from "next/link";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { appName, bytesL, platName, STR, type Locale } from "@/lib/i18n";

export type SimilarApp = {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  iconUrl: string | null;
  platform?: string | null;
  versionName?: string | null;
  fileSize?: number | null;
};

// کارت فشرده‌ی «برنامه‌های مشابه» — حدود ۲۰٪ کوچک‌تر از ردیف استاندارد (عین نمونه)
export default function SimilarCard({
  app, locale, categoryName, developerName,
}: {
  app: SimilarApp;
  locale: Locale;
  categoryName?: string | null;
  developerName?: string | null;
}) {
  const d = STR[locale];
  const name = appName(app, locale);
  const platform = app.platform || "android";
  const meta = [categoryName, developerName].filter(Boolean).join(" • ");
  return (
    <article className="relative flex gap-2.5 bg-card border border-border rounded-[14px] p-[11px] shadow-sm">
      <Link href={`/app/${app.slug}`} className="absolute inset-0 z-[1]" aria-label={name} />
      <span className="w-10 h-10 rounded-[10px] grid place-items-center overflow-hidden shrink-0 bg-primary/[0.13] border border-primary/25 text-primary">
        {app.iconUrl ? (
          <PxImg src={px(app.iconUrl, "icon") || app.iconUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
        ) : (
          <span className="text-base font-bold" dir="ltr">{(app.nameEn || name || "?").charAt(0)}</span>
        )}
      </span>
      <span className="flex-1 min-w-0 pointer-events-none">
        <span className="block text-[12.5px] font-extrabold truncate" dir="auto">{name}</span>
        {meta && <span className="block text-[10px] text-muted-foreground mt-0.5 truncate">{meta}</span>}
        <span className="flex flex-wrap gap-[5px] mt-[7px]">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-background/60 border border-border rounded-full px-2 py-[3px]">
            <span className="text-muted-foreground font-medium">{d.platform}</span>
            {platName(locale, platform)}
          </span>
          {app.fileSize != null && (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-background/60 border border-border rounded-full px-2 py-[3px]">
              <span className="text-muted-foreground font-medium">{d.sizeWord}</span>
              {bytesL(app.fileSize, locale)}
            </span>
          )}
          {app.versionName && (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-background/60 border border-border rounded-full px-2 py-[3px]">
              <span className="text-muted-foreground font-medium">{d.versionWord}</span>
              <span dir="ltr">{app.versionName}</span>
            </span>
          )}
        </span>
      </span>
      <span className="flex flex-col items-end justify-end shrink-0 relative z-[2]">
        <Link
          href={`/app/${app.slug}`}
          className="rounded-lg px-[11px] py-1.5 text-[10.5px] font-extrabold bg-primary text-primary-foreground"
        >
          {d.download}
        </Link>
      </span>
    </article>
  );
}

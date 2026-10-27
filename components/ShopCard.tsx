import Link from "next/link";
import { Download } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import { px } from "@/lib/img";
import { STR, bytesL, platName, type Locale } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

export type ShopApp = {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  iconUrl: string | null;
  shortDesc: string | null;
  shortDescFa: string | null;
  versionName: string | null;
  versionId: string | null;
  fileSize: number | null;
  platform: string;
};

// Soft pastel tiles, same family as the approved sample — deterministic per app.
const PASTELS = ["#e6ecdd", "#fbe3e3", "#e2e6fb", "#fdeec9", "#e0f2f1", "#fce4ec"];

function pastel(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h += slug.charCodeAt(i);
  return PASTELS[h % PASTELS.length];
}

// Shop grid card (approved sample v4): pastel photo-area tile, name,
// platform • size, version + small circular download button.
// No star ratings, no download counts — main specs are platform/size/version only.
export default function ShopCard({ app, locale, index = 0 }: {
  app: ShopApp; locale: Locale; index?: number;
}) {
  const d = STR[locale];
  const plat = (app.platform === "windows" || app.platform === "linux" ? app.platform : "android") as Platform;
  const href = plat === "android" ? `/app/${app.slug}` : `/app/${app.slug}?platform=${plat}`;
  const anim = { animationDelay: `${Math.min(index, 12) * 35}ms` };

  return (
    <article style={anim} className="motion-card motion-pop rounded-[20px] border border-border bg-card p-2.5">
      <div
        className="grid h-[92px] place-items-center overflow-hidden rounded-[14px]"
        style={{ background: pastel(app.slug) }}
        aria-hidden="true"
      >
        <AppIcon
          src={app.iconUrl ? px(app.iconUrl, "icon") || app.iconUrl : null}
          name={app.nameEn || app.nameFa}
          width={92}
          height={92}
          imgClassName="size-14 rounded-2xl object-cover"
          letterClassName="text-[28px] font-extrabold text-[#1e2b52]"
        />
      </div>
      <h3 className="mt-2.5 text-sm font-extrabold leading-6 line-clamp-2">
        <Link href={href} className="hover:text-primary">
          {locale === "fa" ? app.nameFa : app.nameEn || app.nameFa}
        </Link>
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {platName(locale, plat)} • {bytesL(app.fileSize, locale)}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        {app.versionName ? (
          <span className="text-[11.5px] text-muted-foreground" dir="ltr">{app.versionName}</span>
        ) : (
          <span />
        )}
        {app.versionId && (
          <a
            href={`/api/download/${app.versionId}`}
            aria-label={`${d.download} ${locale === "fa" ? app.nameFa : app.nameEn || app.nameFa}`}
            title={d.download}
            className="motion-press grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
          >
            <Download className="size-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

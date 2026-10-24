import Link from "next/link";
import AppIcon from "@/components/AppIcon";
import { px } from "@/lib/img";
import { STR, type Locale } from "@/lib/i18n";
import type { CardApp } from "./AppCard";

// تایل آیکون بزرگ به سبک اپ‌استور — آیکون شناور بدون قاب
export default function AppTile({ app, index = 0, locale = "fa" }: { app: CardApp; index?: number; locale?: Locale }) {
  return (
    <Link
      href={app.platform && app.platform !== "android" ? `/app/${app.slug}?platform=${app.platform}` : `/app/${app.slug}`}
      style={{ animationDelay: `${Math.min(index, 18) * 30}ms` }}
      className="animate-card-in group flex flex-col items-center gap-2 text-center"
    >
      <div className="w-full aspect-square transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        <AppIcon
          src={app.iconUrl ? px(app.iconUrl, "icon") || app.iconUrl : null}
          name={app.nameFa}
          width={192}
          height={192}
          imgClassName="w-full h-full rounded-[24%] object-cover shadow-md"
          letterClassName="w-full h-full rounded-[24%] bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold"
          alt={`${STR[locale].alt_icon} ${app.nameFa}`}
        />
      </div>
      <h3 className="font-semibold text-[13px] leading-5 line-clamp-2 group-hover:text-primary transition-colors w-full">
        {app.nameFa}
      </h3>
    </Link>
  );
}

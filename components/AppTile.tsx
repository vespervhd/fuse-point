import Link from "next/link";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import type { CardApp } from "./AppCard";

function Initial({ name }: { name: string }) {
  const ch = (name || "?").trim().charAt(0);
  return (
    <span
      className="w-full h-full rounded-[24%] bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold"
      aria-hidden="true"
    >
      {ch}
    </span>
  );
}

// تایل آیکون بزرگ به سبک اپ‌استور — آیکون شناور بدون قاب
export default function AppTile({ app, index = 0 }: { app: CardApp; index?: number }) {
  return (
    <Link
      href={app.platform && app.platform !== "android" ? `/app/${app.slug}?platform=${app.platform}` : `/app/${app.slug}`}
      style={{ animationDelay: `${Math.min(index, 18) * 30}ms` }}
      className="animate-card-in group flex flex-col items-center gap-2 text-center"
    >
      <div className="w-full aspect-square transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        {app.iconUrl ? (
          <PxImg
            src={px(app.iconUrl) || app.iconUrl}
            alt={`آیکون ${app.nameFa}`}
            width={192}
            height={192}
            className="w-full h-full rounded-[24%] object-cover shadow-md"
          />
        ) : (
          <Initial name={app.nameFa} />
        )}
      </div>
      <h3 className="font-semibold text-[13px] leading-5 line-clamp-2 group-hover:text-primary transition-colors w-full">
        {app.nameFa}
      </h3>
    </Link>
  );
}

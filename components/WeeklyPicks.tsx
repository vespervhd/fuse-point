import Link from "next/link";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import type { CardApp } from "./AppCard";
import type { Platform } from "@/lib/store";

function appHref(slug: string, platform?: Platform) {
  return platform && platform !== "android" ? `/app/${slug}?platform=${platform}` : `/app/${slug}`;
}

// پیشنهادهای هفته — ۶ اپ با آیکون کوچک
export default function WeeklyPicks({
  apps,
  platform,
}: {
  apps: CardApp[];
  platform?: Platform;
}) {
  if (!apps.length) return null;
  return (
    <section aria-label="پیشنهادهای هفته" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-lg">پیشنهادهای هفته</h2>
        <span className="text-xs text-muted-foreground">منتخب سردبیر</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {apps.map((app, i) => (
          <Link
            key={app.id}
            href={appHref(app.slug, platform)}
            style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
            className="animate-card-in group flex flex-col items-center gap-2 text-center"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              {app.iconUrl ? (
                <PxImg
                  src={px(app.iconUrl, "icon") || app.iconUrl}
                  alt={`آیکون ${app.nameFa}`}
                  width={64}
                  height={64}
                  className="w-full h-full rounded-[24%] object-cover shadow"
                />
              ) : (
                <span
                  className="w-full h-full rounded-[24%] bg-primary/10 text-primary flex items-center justify-center text-xl font-bold"
                  aria-hidden="true"
                >
                  {(app.nameFa || "?").trim().charAt(0)}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold leading-4 line-clamp-2 group-hover:text-primary transition-colors">
              {app.nameFa}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

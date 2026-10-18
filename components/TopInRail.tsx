import Link from "next/link";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { toFaDigits } from "@/lib/fa";
import { Star, ChevronLeft } from "lucide-react";
import type { CardApp } from "./AppCard";
import type { Platform } from "@/lib/store";

function appHref(slug: string, platform?: Platform) {
  return platform && platform !== "android" ? `/app/${slug}?platform=${platform}` : `/app/${slug}`;
}

// ریل افقی «برترین‌های دسته» — مینیمال
export default function TopInRail({
  title,
  categorySlug,
  apps,
  platform,
}: {
  title: string;
  categorySlug: string;
  apps: CardApp[];
  platform?: Platform;
}) {
  if (!apps.length) return null;
  const moreHref = `/category/${categorySlug}${platform && platform !== "android" ? `?platform=${platform}` : ""}`;
  return (
    <section aria-label={title} className="mb-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base font-extrabold">{title}</h2>
        <Link href={moreHref} className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline">
          همه <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {apps.map((app) => (
          <Link
            key={app.id}
            href={appHref(app.slug, platform)}
            className="snap-start shrink-0 flex flex-col items-center gap-2 w-[76px] group text-center"
          >
            <span className="w-16 h-16 block transition-transform group-hover:scale-105">
              {app.iconUrl ? (
                <PxImg
                  src={px(app.iconUrl) || app.iconUrl}
                  alt={`آیکون ${app.nameFa}`}
                  width={64}
                  height={64}
                  className="w-full h-full rounded-[24%] object-cover shadow"
                />
              ) : (
                <span className="w-full h-full rounded-[24%] bg-primary-soft text-primary grid place-items-center text-xl font-bold" aria-hidden="true">
                  {(app.nameFa || "?").trim().charAt(0)}
                </span>
              )}
            </span>
            <span className="text-[11px] font-bold leading-4 line-clamp-2 group-hover:text-primary transition-colors">
              {app.nameFa}
            </span>
            {(app.githubStars ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted -mt-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                {toFaDigits(app.githubStars ?? 0)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

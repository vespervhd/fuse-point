import Link from "next/link";
import PxImg from "@/components/PxImg";
import PlatformBadge from "@/components/PlatformBadge";
import { toFaDigits } from "@/lib/fa";
import { px } from "@/lib/img";
import { Star, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type CardApp = {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  iconUrl: string | null;
  shortDesc: string | null;
  shortDescFa: string | null;
  versionName: string | null;
  downloadCount: number;
  githubStars: number | null;
  platform?: string | null;
  isOpenSource?: boolean | null;
};

function Initial({ name }: { name: string }) {
  const ch = (name || "?").trim().charAt(0);
  return (
    <span
      className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shrink-0"
      aria-hidden="true"
    >
      {ch}
    </span>
  );
}

function Icon({ app }: { app: CardApp }) {
  return app.iconUrl ? (
    <PxImg
      src={px(app.iconUrl) || app.iconUrl}
      alt={`آیکون ${app.nameFa}`}
      width={56}
      height={56}
      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-muted"
    />
  ) : (
    <Initial name={app.nameFa} />
  );
}

function LicenseBadge({ app }: { app: CardApp }) {
  const open = !!app.isOpenSource;
  return (
    <Badge variant={open ? "success" : "info"} className="text-[11px] px-1.5 py-0">
      {open ? "متن‌باز" : "رایگان"}
    </Badge>
  );
}

function Stats({ app }: { app: CardApp }) {
  return (
    <span className="inline-flex items-center gap-3 text-xs opacity-60 shrink-0">
      <span className="inline-flex items-center gap-1">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
        {toFaDigits(app.githubStars ?? 0)}
      </span>
      {(app.downloadCount ?? 0) > 0 && (
        <span className="inline-flex items-center gap-1">
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          {toFaDigits(app.downloadCount ?? 0)}
        </span>
      )}
    </span>
  );
}

export type CardVariant = "standard" | "horizontal";

// کارت برنامه — دو واریانت:
// standard: کارت کامل (صفحه‌ی اصلی، علاقه‌مندی‌ها) — آیکون + نام + توضیح + بج‌ها
// horizontal: فشرده‌ی افقی (نتایج جست‌وجو) — آیکون + نام + بج پلتفرم + آمار
export default function AppCard({
  app,
  index = 0,
  variant = "standard",
}: {
  app: CardApp;
  index?: number;
  variant?: CardVariant;
}) {
  const href =
    app.platform && app.platform !== "android"
      ? `/app/${app.slug}?platform=${app.platform}`
      : `/app/${app.slug}`;
  const anim = { animationDelay: `${Math.min(index, 12) * 35}ms` };
  const desc = app.shortDescFa || app.shortDesc;

  if (variant === "horizontal") {
    return (
      <Link
        href={href}
        style={anim}
        className="animate-card-in card-hover group flex flex-row bg-card border border-border rounded-xl shadow-sm p-3 gap-3 items-center"
      >
        <Icon app={app} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[15px] truncate leading-6 group-hover:text-primary transition-colors">
            {app.nameFa}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <PlatformBadge platform={app.platform} />
            <LicenseBadge app={app} />
            <Stats app={app} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      style={anim}
      className="animate-card-in card-hover group flex flex-col bg-card border border-border rounded-xl shadow-sm"
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Icon app={app} />
          <div className="min-w-0 flex-1">
            <h3 title={app.nameFa} className="font-semibold text-[15px] leading-6 group-hover:text-primary transition-colors line-clamp-2">
              {app.nameFa}
            </h3>
            {desc && <p className="text-xs opacity-60 truncate mt-0.5">{desc}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <PlatformBadge platform={app.platform} />
          <LicenseBadge app={app} />
          <span className="flex-1" />
          <Stats app={app} />
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import PxImg from "@/components/PxImg";
import PlatformBadge from "@/components/PlatformBadge";
import { px } from "@/lib/img";
import { Star, Download } from "lucide-react";

export type CardApp = {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  iconUrl: string | null;
  shortDesc: string | null;
  shortDescFa: string | null;
  versionName: string | null;
  fileSize?: number | null;
  license?: string | null;
  downloadCount: number;
  githubStars: number | null;
  platform?: string | null;
  isOpenSource?: boolean | null;
};

function Initial({ name }: { name: string }) {
  const ch = (name || "?").trim().charAt(0);
  return (
    <span
      className="w-14 h-14 rounded-[9px] bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shrink-0"
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
      className="w-14 h-14 rounded-[9px] object-cover shrink-0 bg-base-300"
    />
  ) : (
    <Initial name={app.nameFa} />
  );
}

function LicenseBadge({ app }: { app: CardApp }) {
  const open = !!app.isOpenSource;
  return (
    <span className={`badge badge-sm ${open ? "badge-success badge-soft" : "badge-info badge-soft"}`}>
      {open ? "متن‌باز" : "رایگان"}
    </span>
  );
}

function Stats({ app }: { app: CardApp }) {
  return (
    <span className="inline-flex items-center gap-3 font-mono text-[11px] text-muted shrink-0">
      <span className="inline-flex items-center gap-1">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
        {(app.githubStars ?? 0).toLocaleString("en-US")}
      </span>
      {(app.downloadCount ?? 0) > 0 && (
        <span className="inline-flex items-center gap-1">
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          {(app.downloadCount ?? 0).toLocaleString("en-US")}
        </span>
      )}
    </span>
  );
}

export type CardVariant = "standard" | "horizontal";

// کارت برنامه — دو واریانت daisyUI:
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
        className="animate-card-in group flex items-center gap-3 px-2 py-[9px] rounded-md hover:bg-white/[0.03] transition-colors"
      >
        {app.iconUrl ? (
          <PxImg
            src={px(app.iconUrl) || app.iconUrl}
            alt={`آیکون ${app.nameFa}`}
            width={40}
            height={40}
            className="w-10 h-10 rounded-[8px] object-cover shrink-0"
          />
        ) : (
          <span className="w-10 h-10 rounded-[8px] bg-surface-2 text-primary flex items-center justify-center text-lg font-bold shrink-0" aria-hidden="true">
            {(app.nameFa || "?").trim().charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-bold text-[13.5px] truncate leading-5">{app.nameFa}</h3>
            {app.nameEn && app.nameEn !== app.nameFa && (
              <span className="text-[11.5px] text-muted truncate">{app.nameEn}</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-0.5">
            <span className="font-mono text-[10.5px] text-muted" dir="ltr" style={{ textAlign: "right" }}>
              {app.versionName ? <>v{app.versionName}</> : null}
              {app.versionName && app.license ? " · " : null}
              {app.license ?? null}
            </span>
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
      className="animate-card-in group block bg-surface border border-border rounded-lg hover:border-primary/40 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Icon app={app} />
          <div className="min-w-0 flex-1">
            <h3 title={app.nameFa} className="card-title text-[15px] leading-6 group-hover:text-primary transition-colors line-clamp-2">
              {app.nameFa}
            </h3>
            {desc && <p className="text-xs opacity-60 truncate mt-0.5">{desc}</p>}
          </div>
        </div>
        <div className="card-actions items-center mt-3">
          <PlatformBadge platform={app.platform} />
          <LicenseBadge app={app} />
          <span className="flex-1" />
          <Stats app={app} />
        </div>
      </div>
    </Link>
  );
}

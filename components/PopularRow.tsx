import Link from "next/link";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";

export type PopularApp = {
  id: string; slug: string; nameFa: string; nameEn: string;
  iconUrl: string | null; shortDesc: string | null; shortDescFa: string | null;
  fileSize: number | null; isOpenSource: boolean | null; platform?: string | null;
  versionName?: string | null; license?: string | null;
  createdAt?: Date | string | null;
};

// حجم فایل با قالب مونو لاتین — مثل مرجع جهت «ج» (11 MB)
function fmtSize(bytes: number | null | undefined): string | null {
  if (bytes == null || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  const r = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${r} ${units[i]}`;
}

// ردیف «پکیج» جهت «ج» — آیکون ۳۲px + نام + متادیتای مونو (نسخه · حجم · مجوز) + دکمه‌ی دریافت
export default function PopularRow({ app, platform, index = 0 }: { app: PopularApp; platform?: string; index?: number }) {
  const href = platform && platform !== "android" ? `/app/${app.slug}?platform=${platform}` : `/app/${app.slug}`;
  const size = fmtSize(app.fileSize);
  return (
    <Link
      href={href}
      title={app.nameFa}
      aria-label={app.nameFa}
      className="flex items-center gap-3 py-2.5 border-b border-border group"
    >
      {app.iconUrl ? (
        <PxImg src={px(app.iconUrl) || "/icons/icon-192.png"} alt="" width={32} height={32}
          className="w-8 h-8 rounded-[7px] object-cover shrink-0" />
      ) : (
        <span className="w-8 h-8 rounded-[7px] bg-surface-2 grid place-items-center text-sm font-bold text-muted shrink-0" dir="ltr">
          {app.nameEn.charAt(0)}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-[13.5px] leading-[1.4] truncate">
          {app.nameFa}
          {app.nameEn && app.nameEn !== app.nameFa && (
            <span className="font-semibold text-[11.5px] text-muted ms-1.5" dir="ltr">{app.nameEn}</span>
          )}
        </span>
        {(app.versionName || size || app.license) && (
          <span className="block font-mono text-[10.5px] text-muted mt-px truncate" dir="ltr" style={{ textAlign: "right" }}>
            {app.versionName && <b className="font-medium text-fg/85">v{app.versionName}</b>}
            {size && <>{app.versionName ? " · " : ""}{size}</>}
            {app.license && <>{app.versionName || size ? " · " : ""}{app.license}</>}
          </span>
        )}
      </span>
      <span
        className={`flex-none rounded-md px-3 py-[5px] text-[12.5px] font-bold border transition-colors ${
          index === 0
            ? "bg-primary text-primary-content border-primary"
            : "border-primary text-primary group-hover:bg-primary-soft"
        }`}
      >
        دریافت
      </span>
    </Link>
  );
}

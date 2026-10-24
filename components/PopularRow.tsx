import Link from "next/link";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";

export type PopularApp = {
  id: string; slug: string; nameFa: string; nameEn: string;
  iconUrl: string | null; shortDesc: string | null; shortDescFa: string | null;
  fileSize: number | null; isOpenSource: boolean | null; platform?: string | null;
  createdAt?: Date | string | null;
};

// کارت فشرده «پرطرفدارها» — رتبه + آیکون + اسم (سایز تطبیقی)
export default function PopularRow({ app, platform, index = 0 }: { app: PopularApp; platform?: string; index?: number }) {
  const href = platform && platform !== "android" ? `/app/${app.slug}?platform=${platform}` : `/app/${app.slug}`;
  const rank = (index + 1).toLocaleString("fa-IR");
  const top3 = index < 3;
  const nameLen = app.nameFa.length;
  const nameSize = nameLen > 22 ? "text-[11px]" : nameLen > 14 ? "text-[12px]" : "text-[13px]";
  return (
    <Link
      href={href}
      title={app.nameFa}
      aria-label={`${rank} — ${app.nameFa}`}
      className="block bg-card border border-border rounded-xl shadow-sm transition-all hover:scale-[1.03]"
    >
      <div className="p-3 flex flex-row items-center gap-2.5">
        <span
          className={`font-extrabold text-lg shrink-0 w-6 text-center ${top3 ? "text-warning" : "opacity-40"}`}
          aria-hidden="true"
        >
          {rank}
        </span>
        {app.iconUrl ? (
          <PxImg src={px(app.iconUrl) || "/icons/icon-192.png"} alt="" width={44} height={44}
            className="w-11 h-11 rounded-xl object-cover shrink-0" />
        ) : (
          <span className="w-11 h-11 rounded-xl bg-muted grid place-items-center text-lg font-bold opacity-60 shrink-0" dir="ltr">
            {app.nameEn.charAt(0)}
          </span>
        )}
        <span className={`flex-1 min-w-0 font-bold leading-5 line-clamp-2 ${nameSize}`}>
          {app.nameFa}
        </span>
      </div>
    </Link>
  );
}

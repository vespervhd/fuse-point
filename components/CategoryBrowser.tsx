"use client";

import Link from "next/link";
import { toFaDigits } from "@/lib/fa";
import DbIcon from "./DbIcon";

type Cat = { id: string; slug: string; nameFa: string; icon?: string | null; appCount?: number };

// مرور مینیمال دسته‌ها — چیپ‌های کوچک افقی
export default function CategoryBrowser({
  cats,
  platform,
}: {
  cats: Cat[];
  platform?: string;
}) {
  if (!cats.length) return null;
  const href = (slug: string) =>
    `/category/${slug}${platform && platform !== "android" ? `?platform=${platform}` : ""}`;

  return (
    <section aria-label="دسته‌بندی‌ها" className="mb-10">
      <h2 className="text-base font-extrabold mb-4 px-1">دسته‌بندی‌ها</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {cats.map((c) => (
          <Link
            key={c.id}
            href={href(c.slug)}
            className="snap-start shrink-0 flex flex-col items-center gap-2 w-[72px] group"
          >
            <span className="w-14 h-14 rounded-2xl bg-card border border-border grid place-items-center text-primary group-hover:border-primary/50 group-hover:scale-105 transition">
              <DbIcon icon={c.icon} className="w-6 h-6" />
            </span>
            <span className="text-[11px] font-bold leading-4 text-center line-clamp-2">
              {c.nameFa}
            </span>
            <span className="text-[10px] text-muted-foreground -mt-1">
              {toFaDigits(c.appCount ?? 0)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

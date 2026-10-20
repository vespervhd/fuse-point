"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Cat = { id: string; slug: string; nameFa: string; icon?: string | null; appCount?: number };

// فهرست ایندکسی دسته‌ها — جهت «ج»: اسلاگ مونو سبز + نام فارسی + شمارش مونو
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
      <div className="mb-1.5">
        <span className="block font-mono text-[10.5px] text-primary" dir="ltr" style={{ textAlign: "right" }}>
          {"// categories"}
        </span>
        <h2 className="text-[15.5px] font-extrabold">دسته‌بندی‌ها</h2>
      </div>
      <div>
        {cats.map((c) => (
          <Link
            key={c.id}
            href={href(c.slug)}
            className="flex items-center gap-3 py-2.5 border-b border-border group"
          >
            <span className="font-mono text-[11.5px] text-primary w-[118px] flex-none truncate" dir="ltr" style={{ textAlign: "left" }}>
              {c.slug}
            </span>
            <span className="font-bold text-[13.5px] flex-1 group-hover:text-primary transition-colors">
              {c.nameFa}
            </span>
            <span className="font-mono text-[10.5px] text-muted">
              {(c.appCount ?? 0).toLocaleString("en-US")}
            </span>
            <ChevronLeft className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

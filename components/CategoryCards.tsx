"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { LayoutGrid } from "lucide-react";
import { toFaDigits } from "@/lib/fa";
import DbIcon from "./DbIcon";

type Cat = { id: string; slug: string; nameFa: string; icon?: string | null; appCount?: number };

// کارت‌های دسته‌بندی — آیکون + اسم کوچک
export default function CategoryCards({ cats }: { cats: Cat[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active = sp.get("cat");

  const go = (slug: string) => {
    const p = sp.get("platform");
    const qs = p === "windows" || p === "linux" ? `?platform=${p}&cat=${slug}` : `?cat=${slug}`;
    const nav = () => startTransition(() => router.push(`/${qs}`, { scroll: false }));
    if (document.startViewTransition) document.startViewTransition(nav);
    else nav();
  };

  if (!cats.length) return null;

  return (
    <section aria-label="دسته‌بندی‌ها" className="mb-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base font-extrabold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" aria-hidden="true" />
          دسته‌بندی‌ها
        </h2>
        <span className="badge badge-ghost badge-sm font-bold">
          {toFaDigits(cats.length)} دسته
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {cats.map((c) => {
          const isActive = active === c.slug;
          const hue = [...c.slug].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
          const grad = { background: `linear-gradient(135deg, hsl(${hue} 70% 55% / 0.14), hsl(${hue} 70% 55% / 0.03))` };
          return (
            <button
              key={c.id}
              onClick={() => go(c.slug)}
              aria-label={c.nameFa}
              aria-current={isActive ? "true" : undefined}
              style={isActive ? undefined : grad}
              className={`w-[76px] rounded-2xl p-2.5 flex flex-col items-center gap-1.5 text-center transition-all shrink-0 border ${
                isActive
                  ? "bg-primary text-primary-content border-primary shadow"
                  : "text-primary border-base-300/60 hover:border-primary/40 hover:-translate-y-0.5"
              } ${pending ? "opacity-70" : ""}`}
            >
              <DbIcon icon={c.icon} className="w-7 h-7 shrink-0" />
              <span className="text-[10px] font-bold leading-3.5 line-clamp-2 text-base-content">{c.nameFa}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

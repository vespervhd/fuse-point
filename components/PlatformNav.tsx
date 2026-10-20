"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";


type Platform = "android" | "windows" | "linux";

const PLATFORMS: { slug: Platform; label: string }[] = [
  { slug: "android", label: "اندروید" },
  { slug: "windows", label: "ویندوز" },
  { slug: "linux", label: "لینوکس" },
];

function PlatformNavInner() {
  const sp = useSearchParams();
  const pathname = usePathname();

  // روی صفحه‌ی جزئیات برنامه، ناو سراسری مخفی می‌شه تا با پلتفرم واقعی
  // اون برنامه اشتباه گرفته نشه (بج PlatformBadge پلتفرم واقعی رو نشون می‌ده)
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;
  const urlPlatform = sp.get("platform") as Platform | null;
  const [stored, setStored] = useState<Platform | null>(null);

  // خواندن پلتفرم از localStorage در هر تغییر مسیر
  // فقط برای صفحه‌هایی که پلتفرم توی URL نیست (مثل /app و /collection)
  // توی صفحه اصلی، URL حرف اول رو می‌زنه
  useEffect(() => {
    try {
      if (pathname === "/") {
        // صفحه اصلی: فقط URL مهمه، localStorage نادیده گرفته می‌شه
        setStored(null);
      } else {
        const s = localStorage.getItem("narm-platform") as Platform | null;
        setStored(s === "windows" || s === "linux" ? s : null);
      }
    } catch {
      setStored(null);
    }
  }, [pathname, urlPlatform]);

  const current = urlPlatform || stored || "android";

  const savePlatform = (p: Platform) => {
    try {
      if (p === "android") localStorage.removeItem("narm-platform");
      else localStorage.setItem("narm-platform", p);
    } catch {}
  };

  const href = (p: Platform) => {
    const params = new URLSearchParams(sp.toString());
    if (p === "android") params.delete("platform");
    else params.set("platform", p);
    params.delete("cat");
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <nav
      className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none"
      aria-label="انتخاب پلتفرم"
    >
      <div dir="ltr" className="pointer-events-auto flex items-center rounded-full p-[3px] gap-0.5 bg-base-200 border border-base-300 shadow-lg font-mono text-[10.5px]">
        {PLATFORMS.map((p) => {
          const active = current === p.slug;
          return (
            <Link
              key={p.slug}
              href={href(p.slug)}
              onClick={() => savePlatform(p.slug)}
              aria-pressed={active}
              title={p.label}
              aria-label={p.label}
              className={`rounded-full px-3.5 py-[5px] leading-none transition-colors ${
                active
                  ? "bg-primary-soft text-primary font-medium"
                  : "text-muted hover:text-fg"
              }`}
            >
              {p.slug}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function PlatformNav() {
  return (
    <Suspense fallback={null}>
      <PlatformNavInner />
    </Suspense>
  );
}

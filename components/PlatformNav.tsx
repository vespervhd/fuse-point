"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { STR, type Locale } from "@/lib/i18n";

type Platform = "android" | "windows" | "linux";

const PLATFORMS: Platform[] = ["android", "windows", "linux"];

// نوار ثابت پایین — سوییچ فضای پلتفرم (دقیقاً ۳ گزینه، بدون «همه»)، عین نمونه
// در صفحه‌ی اپ مخفی است: آن‌جا رکورد خود برنامه پلتفرمش را مشخص می‌کند
function PlatformNavInner({ locale }: { locale: Locale }) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [stored, setStored] = useState<Platform | null>(null);
  const d = STR[locale];

  const onAppPage = pathname === "/app" || pathname.startsWith("/app/");

  useEffect(() => {
    try {
      const s = localStorage.getItem("narm-platform") as Platform | null;
      setStored(s === "windows" || s === "linux" ? s : null);
    } catch {
      setStored(null);
    }
  }, [pathname]);

  // چسبندگی فضای پلتفرم: اگر کاربر قبلاً ویندوز/لینوکس را انتخاب کرده و این صفحه
  // پارامتر platform ندارد، همان فضا روی URL اعمال می‌شود تا محتوای صفحه با
  // فضای انتخابی یکی بماند (لینک‌های ساده‌ی هدر/فوتر پارامتر را حمل نمی‌کنند).
  useEffect(() => {
    if (!stored || onAppPage) return;
    if (sp.get("platform")) return;
    if (/^\/(admin|login|signup|report)(\/|$)/.test(pathname)) return;
    const params = new URLSearchParams(sp.toString());
    params.set("platform", stored);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [stored, onAppPage, pathname, sp, router]);

  if (onAppPage) return null;

  const urlPlatform = sp.get("platform") as Platform | null;
  const current: Platform =
    urlPlatform === "windows" || urlPlatform === "linux" ? urlPlatform : stored ?? "android";

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
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] bg-background/[0.84] backdrop-blur-xl border-t border-border"
        aria-label={d.platform}
      >
        <div className="inline-flex bg-card border border-border rounded-full p-1 gap-0.5" role="tablist" aria-label={d.platform}>
          {PLATFORMS.map((p) => {
            const active = current === p;
            return (
              <Link
                key={p}
                href={href(p)}
                onClick={() => savePlatform(p)}
                role="tab"
                aria-selected={active}
                className={`px-5 py-2 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground font-extrabold"
                    : "text-muted-foreground font-medium hover:text-foreground"
                }`}
              >
                {p === "android" ? d.plat_android : p === "windows" ? d.plat_windows : d.plat_linux}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default function PlatformNav({ locale = "fa" }: { locale?: Locale }) {
  return (
    <Suspense fallback={null}>
      <PlatformNavInner locale={locale} />
    </Suspense>
  );
}

// فاصله‌گذار انتهای صفحه تا محتوای پایانی زیر نوار ثابت نرود (در صفحه‌ی اپ رندر نمی‌شود)
export function BottomSpacer() {
  const pathname = usePathname();
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;
  return <div className="h-[calc(76px+env(safe-area-inset-bottom))]" aria-hidden="true" />;
}

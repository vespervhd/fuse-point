"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { STR, type Locale } from "@/lib/i18n";

type Platform = "android" | "windows" | "linux";

const PLATFORMS: Platform[] = ["android", "windows", "linux"];

// آیکون‌های پلتفرم — اینلاین SVG، بدون ایموجی و بدون حرف
const AndroidMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="block w-full h-full">
    <path d="M17.6 9.5a5.6 5.6 0 0 0-11.2 0Zm-8-3.9-1.3-2.2a.3.3 0 0 1 .5-.3l1.3 2.2a6.5 6.5 0 0 1 5.8 0l1.3-2.2a.3.3 0 0 1 .5.3l-1.3 2.2A5.6 5.6 0 0 1 17.6 9.5H6.4a5.6 5.6 0 0 1 3.2-3.9ZM9.2 8a.6.6 0 1 0 0-1.1.6.6 0 0 0 0 1.1Zm5.6 0a.6.6 0 1 0 0-1.1.6.6 0 0 0 0 1.1ZM6 10.3h12v8a1.7 1.7 0 0 1-1.7 1.7h-.9v2.4a1.3 1.3 0 0 1-2.6 0V20h-1.6v2.4a1.3 1.3 0 0 1-2.6 0V20h-.9A1.7 1.7 0 0 1 6 18.3Z" />
  </svg>
);
const WindowsMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="block w-full h-full">
    <path d="M3.5 3.5h8v8h-8zM12.5 3.5h8v8h-8zM3.5 12.5h8v8h-8zM12.5 12.5h8v8h-8z" />
  </svg>
);
const LinuxMark = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="block w-full h-full">
    <rect x="2.8" y="4" width="18.4" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="m6.5 9 3 3-3 3M12.5 15.5H17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
function PlatformMark({ platform }: { platform: Platform }) {
  if (platform === "windows") return <WindowsMark />;
  if (platform === "linux") return <LinuxMark />;
  return <AndroidMark />;
}

// نوار ثابت پایین — سوییچ فضای پلتفرم (دقیقاً ۳ گزینه، بدون «همه»)
// در صفحه‌ی اپ مخفی است: آن‌جا رکورد خود برنامه پلتفرمش را مشخص می‌کند
// فقط یک کپسول کوچک وسط‌چین پایین صفحه است — نه نوار عریض سراسری، نه بوردر:
// کپسول به اندازه‌ی سه دکمه‌اش است و شناور روی محتواست. دکمه‌ها فقط آیکون‌اند؛
// پلتفرم فعال با رنگ اکسنت (پررنگ + پس‌زمینه‌ی ملایم اکسنت) مشخص می‌شود
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
    // همگام‌سازی فوری state با localStorage — بدون این، افکت چسبندگی با مقدار
    // کهنه‌ی stored، تپِ اندروید (URL بدون پارامتر) را به پلتفرم قبلی برمی‌گرداند
    // و نوار روی گوشی گیر می‌کرد تا رفرش دستی
    setStored(p === "android" ? null : p);
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
        className="fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40"
        aria-label={d.platform}
      >
        <div className="inline-flex bg-card rounded-full p-1 gap-0.5 shadow-md" role="tablist" aria-label={d.platform}>
          {PLATFORMS.map((p) => {
            const active = current === p;
            const label = p === "android" ? d.plat_android : p === "windows" ? d.plat_windows : d.plat_linux;
            return (
              <Link
                key={p}
                href={href(p)}
                onClick={() => savePlatform(p)}
                role="tab"
                aria-selected={active}
                aria-label={label}
                title={label}
                className={`p-2.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="block w-[30px] h-[30px]">
                  <PlatformMark platform={p} />
                </span>
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

// فاصله‌گذار انتهای صفحه تا محتوای پایانی زیر کپسول شناور نرود (در صفحه‌ی اپ
// رندر نمی‌شود). ارتفاع کپسول ۵۸px است (دکمه‌ی ۵۰px + پدینگ ۸px) + فاصله‌ی
// ۱۲px از پایین = ۷۰px؛ ۷۶px حاشیه‌ی ۶px هم می‌دهد تا هیچ کارتی از پشت
// کپسول سرک نکشد
export function BottomSpacer() {
  const pathname = usePathname();
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;
  return <div className="h-[calc(76px+env(safe-area-inset-bottom))]" aria-hidden="true" />;
}

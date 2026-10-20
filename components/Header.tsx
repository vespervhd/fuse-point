"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotifBell from "./NotifBell";
import ThemeToggle from "./ThemeToggle";
import PlatformNav from "./PlatformNav";

// نشان حلقه‌ای وسپر — همان موتیف سیاه‌چاله‌ی جهت «ج»
function RingMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <circle cx="16" cy="16" r="6.4" fill="#000" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
      <ellipse cx="16" cy="16" rx="13.6" ry="4.9" fill="none" stroke="currentColor" strokeWidth="1.7" transform="rotate(-16 16 16)" />
    </svg>
  );
}

const NAV = [
  { href: "/", label: "home" },
  { href: "/categories", label: "catalog" },
  { href: "/collections", label: "collections" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-40 bg-base-100/85 backdrop-blur border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Vesper - صفحه‌ی اصلی" className="flex items-center gap-2 shrink-0">
            <RingMark />
            <span className="font-wordmark text-[17px] leading-none" dir="ltr">Vesper</span>
            <span className="font-mono text-[10px] font-medium text-primary border border-border rounded px-1.5 py-px" dir="ltr">
              store
            </span>
          </Link>

          <nav dir="ltr" aria-label="main" className="hidden sm:flex items-center gap-4 font-mono text-[11px]">
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? "text-fg font-medium" : "text-muted hover:text-fg transition-colors"}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0 rounded-full bg-base-200/60 border border-border p-1">
            <NotifBell />
            <span className="w-px h-6 bg-base-300 shrink-0" aria-hidden="true" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <PlatformNav />
      <div className="h-10" aria-hidden="true" />
    </>
  );
}

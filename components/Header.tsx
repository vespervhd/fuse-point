"use client";

import Link from "next/link";
import NotifBell from "./NotifBell";
import ThemeToggle from "./ThemeToggle";
import PlatformNav from "./PlatformNav";

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur border-b border-base-300">
        <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 min-h-14 h-14 p-0">
          <div className="navbar-start">
            <Link href="/" aria-label="Fuse Point - صفحه‌ی اصلی" className="shrink-0">
              <img src="/icons/icon-192.png" alt="Fuse Point" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
            </Link>
          </div>
          <div className="navbar-end">
            <div className="flex items-center shrink-0 rounded-full bg-base-200/60 p-1">
              <NotifBell />
              <span className="w-px h-6 bg-base-300 shrink-0" aria-hidden="true" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <PlatformNav />
      <div className="h-10" aria-hidden="true" />
    </>
  );
}

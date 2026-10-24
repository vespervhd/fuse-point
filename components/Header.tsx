import Link from "next/link";
import { Search } from "lucide-react";
import NotifBell from "./NotifBell";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import FavHeaderButton from "./FavHeaderButton";
import PlatformNav from "./PlatformNav";
import { LogoMark, Wordmark } from "./Logo";
import { STR, type Locale } from "@/lib/i18n";

// هدر — عین نمونه: لوگوی جرقه + وردمارک مینیمال، و سمت دیگر: زبان، تم، علاقه‌مندی، اعلان، جستجو
export default function Header({ locale = "fa" }: { locale?: Locale }) {
  const d = STR[locale];
  return (
    <>
      <header className="sticky top-0 z-50 bg-background/[0.84] backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-2.5 h-[58px] w-full max-w-[1120px] mx-auto px-4">
          <Link href="/" aria-label="Fuse Point" className="flex items-center gap-[9px] shrink-0 text-foreground">
            <LogoMark size={34} />
            <Wordmark size={13.5} />
          </Link>
          <div className="ms-auto flex items-center gap-1.5">
            <LangToggle locale={locale} />
            <ThemeToggle locale={locale} />
            <FavHeaderButton locale={locale} />
            <NotifBell locale={locale} />
            <Link href="/search" aria-label={d.headerSearch} className="hdr-icon-btn">
              <Search className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <PlatformNav locale={locale} />
    </>
  );
}

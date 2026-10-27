import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import { LogoMark, Wordmark } from "./Logo";
import { STR, type Locale } from "@/lib/i18n";

// Minimal header (approved sample + LandingGo direction): brand mark +
// wordmark, center nav links (existing routes only), theme dot + lang toggle.
// No sign-in button here — the account entry lives in the bottom bar.
const NAV = [
  { href: "/", key: "home" },
  { href: "/categories", key: "cats" },
  { href: "/collections", key: "cols" },
  { href: "/how-we-verify", key: "whyTitle" },
] as const;

export default function Header({ locale = "fa" }: { locale?: Locale }) {
  const d = STR[locale];
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-[50px] w-full max-w-[680px] items-center gap-2 px-4">
        <Link href="/" aria-label="Fuse Point" className="flex shrink-0 items-center gap-2 text-foreground">
          <LogoMark size={24} />
          <Wordmark size={13} />
        </Link>
        <nav aria-label="Fuse Point" className="hidden flex-1 items-center justify-center gap-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="motion-press rounded-full px-3 py-2 text-[13px] font-bold text-muted-foreground hover:bg-card hover:text-foreground"
            >
              {d[item.key]}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2 sm:ms-0">
          <ThemeToggle locale={locale} />
          <LangToggle locale={locale} />
        </div>
      </div>
    </header>
  );
}

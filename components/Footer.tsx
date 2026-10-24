import Link from "next/link";
import { LogoMark, Wordmark } from "./Logo";
import { STR, YEAR, type Locale } from "@/lib/i18n";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 1.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
  </svg>
);

// فوتر مینیمال — عین نمونه‌ی تأییدشده: خط جریان، ردیف برند، وضعیت آرشیو، یک ردیف لینک، گیت‌هابِ مالک، ©
// (تلگرام فعلاً حذف شده به دستور مالک؛ گیت‌هاب به پروفایل شخصی او وصل است)
export default function Footer({ locale = "fa" }: { locale?: Locale }) {
  const d = STR[locale];
  const links = [
    { href: "/categories", label: d.cats },
    { href: "/collections", label: d.cols },
    { href: "/how-we-verify", label: d.whyTitle },
    { href: "/favorites", label: d.favs },
    { href: "/request", label: d.reqApp },
  ];
  return (
    <footer className="relative mt-14 border-t border-border">
      <div className="foot-line" aria-hidden="true" />
      <div className="w-full max-w-[1120px] mx-auto px-4 pt-[22px] pb-[26px]">
        <div className="flex items-center gap-[9px]">
          <LogoMark size={30} />
          <Wordmark size={16.5} />
        </div>
        <p className="text-muted-foreground text-xs leading-[1.9] mt-3">{d.footDesc}</p>

        <div className="flex items-start gap-[9px] mt-3.5">
          <span className="w-2 h-2 rounded-full bg-[#43b581] shadow-[0_0_9px_#43b581] mt-[7px] shrink-0" aria-hidden="true" />
          <div>
            <b className="block text-[13.5px] font-extrabold">{d.footStatus}</b>
            <span className="block text-muted-foreground text-xs mt-0.5">{d.footStatusSub}</span>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-1 gap-y-0.5 mt-3" aria-label="Fuse Point">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13.5px] font-bold min-h-[44px] px-2.5 py-2 rounded-[10px] inline-flex items-center hover:bg-card hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-2 mt-2">
          <a
            href="https://github.com/vespervhd"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="w-9 h-9 border border-border rounded-[10px] grid place-items-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
          >
            <GithubIcon className="w-[18px] h-[18px]" />
          </a>
        </div>

        <div className="mt-4 pt-3.5 border-t border-border text-muted-foreground text-xs flex flex-wrap items-center justify-between gap-2.5">
          <span dir="ltr">© Fuse Point</span>
          <span className="flex items-center gap-3">
            <Link href="/page/terms" className="hover:text-foreground">{d.terms}</Link>
            <Link href="/page/privacy" className="hover:text-foreground">{d.privacy}</Link>
            <span>{YEAR[locale]}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

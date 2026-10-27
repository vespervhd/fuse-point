import Link from "next/link";
import { ShieldCheck, Hash } from "lucide-react";
import { LogoMark, Wordmark } from "./Logo";
import { STR, YEAR, type Locale } from "@/lib/i18n";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 1.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
  </svg>
);

// TravelCo-style footer (user's pick): brand + short description + contact,
// link columns from existing routes only, GitHub as the only social,
// trust badges with only truthful properties, bottom bar. No newsletter box,
// no Telegram — both explicitly excluded by the owner.
export default function Footer({ locale = "fa" }: { locale?: Locale }) {
  const d = STR[locale];
  const cols: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: d.footStore,
      links: [
        { href: "/categories", label: d.cats },
        { href: "/collections", label: d.cols },
        { href: "/fresh", label: d.fresh },
      ],
    },
    {
      title: d.footTrust,
      links: [
        { href: "/how-we-verify", label: d.whyTitle },
        { href: "/open-source", label: d.ext_openSource },
        { href: "/guides", label: d.ext_guides },
      ],
    },
    {
      title: d.footExplore,
      links: [
        { href: "/popular", label: d.ext_popular },
        { href: "/latest", label: d.ext_latest },
        { href: "/top", label: d.ext_top },
      ],
    },
  ];
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto w-full max-w-[680px] px-4 py-8">
        <div className="flex flex-col gap-8 sm:grid sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark size={28} />
              <Wordmark size={15} />
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">{d.footDesc}</p>
            <div className="mt-3 flex gap-2">
              <a
                href="https://github.com/vespervhd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="motion-press grid size-9 place-items-center rounded-[10px] border border-border text-muted-foreground hover:text-foreground"
              >
                <GithubIcon className="size-[18px]" />
              </a>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {d.footContact}:{" "}
              <a
                href="https://github.com/vespervhd"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="font-bold text-primary"
              >
                github.com/vespervhd
              </a>
            </p>
          </div>
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[13px] font-extrabold">{col.title}</h3>
              <ul className="mt-3 space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-[36px] items-center text-[13px] font-bold text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            {d.badgeFree}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">
            <Hash className="size-4 text-primary" aria-hidden="true" />
            {d.badgeSha}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
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

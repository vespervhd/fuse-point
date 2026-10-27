"use client";

import { LANG_COOKIE, STR, type Locale } from "@/lib/i18n";

// Language toggle — sets the fp-lang cookie and reloads so the server renders
// the new language on the first paint (router.refresh could serve stale RSC).
export default function LangToggle({ locale }: { locale: Locale }) {
  const next: Locale = locale === "fa" ? "en" : "fa";
  return (
    <button
      type="button"
      className="motion-press grid h-8 min-w-10 shrink-0 place-items-center rounded-full border border-border bg-card px-2.5 text-xs font-extrabold text-foreground"
      aria-label={STR[locale].langSwitch}
      title={STR[locale].langSwitch}
      onClick={() => {
        try {
          document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
          localStorage.setItem(LANG_COOKIE, next);
        } catch {}
        window.location.reload();
      }}
    >
      {next === "en" ? "EN" : "فا"}
    </button>
  );
}

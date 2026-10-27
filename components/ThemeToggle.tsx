"use client";

import { useEffect, useState } from "react";
import { STR, THEME_NAMES, type Locale } from "@/lib/i18n";

const THEMES = ["light", "sky", "embers", "aurora", "constellation"] as const;
type Theme = (typeof THEMES)[number];

// Circle theme button — dot only, no text (approved sample). Cycles all 5
// themes and persists with the existing vesper-theme key. The inline script
// in layout.tsx applies the saved theme before first paint, so there is no flash.
export default function ThemeToggle({ locale = "fa" }: { locale?: Locale }) {
  const [theme, setTheme] = useState<Theme>("light");
  const d = STR[locale];

  useEffect(() => {
    const t = localStorage.getItem("vesper-theme");
    if (t && (THEMES as readonly string[]).includes(t)) setTheme(t as Theme);
  }, []);

  const cycle = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    try {
      localStorage.setItem("vesper-theme", next);
    } catch {}
    document.documentElement.setAttribute("data-theme", next);
  };

  const label = `${d.themeChange} — ${d.themeIs}: ${THEME_NAMES[locale][theme]}`;
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="motion-press grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground"
    >
      <span className="block size-3 rounded-full bg-primary" aria-hidden="true" />
    </button>
  );
}

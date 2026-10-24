"use client";

import { useEffect, useState } from "react";
import { sparkBurst } from "@/lib/fx/spark";
import { STR, THEME_NAMES, type Locale } from "@/lib/i18n";

const THEMES = ["sky", "embers", "aurora", "constellation"] as const;
type Theme = (typeof THEMES)[number];

// دکمه‌ی دایره‌ای تم هدر — دایره با نقطه‌ی نورانی به رنگ تم (عین نمونه)؛ چرخه‌ی چهار تم زنده
export default function ThemeToggle({ locale = "fa" }: { locale?: Locale }) {
  const [theme, setTheme] = useState<Theme>("sky");
  const d = STR[locale];

  useEffect(() => {
    const t = localStorage.getItem("vesper-theme");
    if (t && (THEMES as readonly string[]).includes(t)) setTheme(t as Theme);
  }, []);

  const cycle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    try {
      localStorage.setItem("vesper-theme", next);
    } catch {}
    document.documentElement.setAttribute("data-theme", next);
    sparkBurst(e.currentTarget);
  };

  const label = `${d.themeChange} — ${d.themeIs}: ${THEME_NAMES[locale][theme]}`;
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="theme-dot-btn"
    >
      <span className="dot" aria-hidden="true" />
    </button>
  );
}

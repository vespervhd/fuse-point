"use client";

import { LANG_COOKIE, STR, type Locale } from "@/lib/i18n";
import { sparkBurst } from "@/lib/fx/spark";

// دکمه‌ی تعویض زبان هدر — کوکی fp-lang را ست می‌کند و صفحه را با همان زبان از سرور می‌گیرد
// رفرش نرم (router.refresh) کافی نبود: پاسخ RSC می‌توانست از کش برگردد و زبان عوض نشود؛
// ریلود کامل سند یعنی سرور با کوکی تازه رندر می‌کند — تعویض در همان کلیک اول، هر دو جهت.
export default function LangToggle({ locale }: { locale: Locale }) {
  const next: Locale = locale === "fa" ? "en" : "fa";
  return (
    <button
      type="button"
      className="lang-pill"
      aria-label={STR[locale].langSwitch}
      title={STR[locale].langSwitch}
      onClick={(e) => {
        try {
          document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
          localStorage.setItem(LANG_COOKIE, next);
        } catch {}
        sparkBurst(e.currentTarget);
        window.location.reload();
      }}
    >
      {next === "en" ? "EN" : "فا"}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { MoonStar, Crown, TreePine, Terminal } from "lucide-react";

const THEMES = ["protool", "dim", "dracula", "halloween", "luxury", "forest"] as const;
type Theme = (typeof THEMES)[number];
const LABELS: Record<Theme, string> = {
  protool: "حرفه‌ای",
  dim: "دیم",
  dracula: "دراکولا",
  halloween: "هالووین",
  luxury: "لوکس",
  forest: "جنگل",
};

// خفاش — آیکون تم دراکولا
const BAT_PATH =
  "M1 8 Q4 8 5.5 5 Q7 8 9 8 Q10.5 8 12 5 Q13.5 8 15 8 Q17 8 18.5 5 Q20 8 23 8 Q20 9 19 11 Q17 9.5 15 10.5 Q13 12 12 15 Q11 12 9 10.5 Q7 9.5 5 11 Q4 9 1 8 Z";

// کدو — آیکون تم هالووین
function PumpkinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 9c-4.5 0-8 2.2-8 5.5S7.5 20 12 20s8-2.2 8-5.5S16.5 9 12 9Z" />
      <path d="M12 9v11" />
      <path d="M8.5 9.8C7.8 11.5 7.8 17.5 8.5 19.2" />
      <path d="M15.5 9.8c.7 1.7.7 7.7 0 9.4" />
      <path d="M12 9c0-2.5 1.5-4 4-4.5" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "protool") return <Terminal className="h-5 w-5" aria-hidden="true" />;
  if (theme === "dracula") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d={BAT_PATH} />
      </svg>
    );
  }
  if (theme === "halloween") return <PumpkinIcon />;
  if (theme === "luxury") return <Crown className="h-5 w-5" aria-hidden="true" />;
  if (theme === "forest") return <TreePine className="h-5 w-5" aria-hidden="true" />;
  return <MoonStar className="h-5 w-5" aria-hidden="true" />;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("protool");

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

  return (
    <button
      onClick={cycle}
      aria-label="تغییر تم"
      title={`تم فعلی: ${LABELS[theme]} — برای تغییر بزن`}
      className="btn btn-ghost btn-circle"
    >
      <span key={theme} className="inline-flex animate-[spin_0.35s_ease]">
        <ThemeIcon theme={theme} />
      </span>
    </button>
  );
}

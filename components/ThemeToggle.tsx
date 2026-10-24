"use client";

import { useEffect, useState } from "react";
import { CloudMoon, Flame, Sparkles, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEMES = ["sky", "embers", "aurora", "constellation"] as const;
type Theme = (typeof THEMES)[number];
const LABELS: Record<Theme, string> = {
  sky: "آسمان زنده",
  embers: "اخگر زنده",
  aurora: "شفق زنده",
  constellation: "صور فلکی زنده",
};

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "embers") return <Flame className="h-5 w-5" aria-hidden="true" />;
  if (theme === "aurora") return <Sparkles className="h-5 w-5" aria-hidden="true" />;
  if (theme === "constellation") return <Orbit className="h-5 w-5" aria-hidden="true" />;
  return <CloudMoon className="h-5 w-5" aria-hidden="true" />;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("sky");

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
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label="تغییر تم"
      title={`تم فعلی: ${LABELS[theme]} — برای تغییر بزن`}
      className="rounded-full"
    >
      <span key={theme} className="inline-flex animate-[spin_0.35s_ease]">
        <ThemeIcon theme={theme} />
      </span>
    </Button>
  );
}

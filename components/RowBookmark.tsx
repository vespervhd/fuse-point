"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { sparkBurst } from "@/lib/fx/spark";
import { STR, type Locale } from "@/lib/i18n";

// وضعیت علاقه‌مندی‌ها یک‌بار گرفته و بین همه‌ی دکمه‌ها کش می‌شود
let favCache: Promise<Set<string>> | null = null;
const listeners = new Set<() => void>();
function loadFavs(): Promise<Set<string>> {
  if (!favCache) {
    favCache = fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : { favorites: [] }))
      .then((j) => new Set<string>((j.favorites || []).map((f: any) => f.appId)))
      .catch(() => new Set<string>());
  }
  return favCache;
}
function notify() { listeners.forEach((f) => f()); }

// دکمه‌ی «نشان» کوچک روی ردیف‌ها و کارت‌های مشابه — به بک‌اند علاقه‌مندی‌ها وصل است
export default function RowBookmark({
  appId, slug, locale, size = 44,
}: {
  appId: string; slug: string; locale: Locale; size?: number;
}) {
  const [faved, setFaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const d = STR[locale];

  useEffect(() => {
    let alive = true;
    const sync = () => { loadFavs().then((s) => { if (alive) setFaved(s.has(appId)); }); };
    sync();
    listeners.add(sync);
    return () => { alive = false; listeners.delete(sync); };
  }, [appId]);

  const toggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/favorites", {
        method: faved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });
      if (r.status === 401) { router.push(`/login?next=/app/${slug}`); return; }
      if (r.ok) {
        const j = await r.json();
        const s = await loadFavs();
        if (j.favorited) { s.add(appId); sparkBurst(e.currentTarget); } else s.delete(appId);
        notify();
      }
    } catch {}
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={d.favToggle}
      aria-pressed={faved}
      title={d.favToggle}
      className={`grid place-items-center rounded-[10px] shrink-0 transition-colors ${
        faved ? "text-primary [&_svg]:fill-primary" : "text-muted-foreground hover:text-foreground"
      }`}
      style={{ width: size, height: size }}
    >
      <Bookmark style={{ width: size <= 32 ? 17 : 19, height: size <= 32 ? 17 : 19 }} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Bookmark } from "lucide-react";
import { sparkBurst } from "@/lib/fx/spark";
import { STR, type Locale } from "@/lib/i18n";

// ردیف کپسول‌های صفحه‌ی اپ: «دنبال کردن» + «نشان» — هر دو به بک‌اند واقعی وصل‌اند
// خط راهنمای پیگیری فقط وقتی نمایش داده می‌شود که پیگیری فعال باشد (عین نمونه)
export default function Capsules({
  appId, slug, locale,
}: {
  appId: string; slug: string; locale: Locale;
}) {
  const d = STR[locale];
  const router = useRouter();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [faved, setFaved] = useState<boolean | null>(null);
  const [busyF, setBusyF] = useState(false);
  const [busyB, setBusyB] = useState(false);
  const followRef = useRef<HTMLButtonElement>(null);
  const favRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch(`/api/follows?appId=${appId}`)
      .then((r) => r.json())
      .then((j) => setFollowing(!!j.following))
      .catch(() => setFollowing(false));
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : { favorites: [] }))
      .then((j) => setFaved((j.favorites || []).some((f: any) => f.appId === appId)))
      .catch(() => setFaved(false));
  }, [appId]);

  const login = () => router.push(`/login?next=/app/${slug}`);

  const toggleFollow = async () => {
    if (following === null || busyF) return;
    setBusyF(true);
    try {
      const res = await fetch(following ? `/api/follows?appId=${appId}` : "/api/follows", {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: following ? undefined : JSON.stringify({ appId }),
      });
      if (res.status === 401) { login(); return; }
      if (res.ok) {
        const j = await res.json();
        setFollowing(!!j.following);
        if (j.following) sparkBurst(followRef.current);
      }
    } catch {}
    setBusyF(false);
  };

  const toggleFav = async () => {
    if (faved === null || busyB) return;
    setBusyB(true);
    try {
      const r = await fetch("/api/favorites", {
        method: faved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });
      if (r.status === 401) { login(); return; }
      if (r.ok) {
        const j = await r.json();
        setFaved(!!j.favorited);
        if (j.favorited) sparkBurst(favRef.current);
      }
    } catch {}
    setBusyB(false);
  };

  return (
    <>
      <div className="fp-capsules">
        <button
          type="button"
          ref={followRef}
          onClick={toggleFollow}
          disabled={following === null || busyF}
          aria-pressed={!!following}
          className={`fp-cap${following ? " on" : ""}`}
        >
          <Bell strokeWidth={1.9} aria-hidden="true" />
          <span>{following ? d.following : d.follow}</span>
        </button>
        <button
          type="button"
          ref={favRef}
          onClick={toggleFav}
          disabled={faved === null || busyB}
          aria-pressed={!!faved}
          aria-label={d.favToggle}
          className={`fp-cap${faved ? " faved" : ""}`}
        >
          <Bookmark strokeWidth={1.9} aria-hidden="true" />
          <span>{d.save}</span>
        </button>
      </div>
      {following && <p className="fp-follow-note">{d.followNote}</p>}
    </>
  );
}

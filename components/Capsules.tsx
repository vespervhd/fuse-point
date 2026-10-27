"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { STR, type Locale } from "@/lib/i18n";

// کپسول صفحه‌ی اپ — فقط «دنبال کردن»؛ علاقه‌مندی حالا قلب کنار دکمه‌ی
// دانلود است (FavoriteButton) تا دو کنترل موازی برای یک کار نباشد.
// خط راهنمای پیگیری فقط وقتی نمایش داده می‌شود که پیگیری فعال باشد.
export default function Capsules({
  appId, slug, locale,
}: {
  appId: string; slug: string; locale: Locale;
}) {
  const d = STR[locale];
  const router = useRouter();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const followRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch(`/api/follows?appId=${appId}`)
      .then((r) => r.json())
      .then((j) => setFollowing(!!j.following))
      .catch(() => setFollowing(false));
  }, [appId]);

  const login = () => router.push(`/login?next=/app/${slug}`);

  const toggleFollow = async () => {
    if (following === null || busy) return;
    setBusy(true);
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
      }
    } catch {}
    setBusy(false);
  };

  return (
    <>
      <button
        type="button"
        ref={followRef}
        onClick={toggleFollow}
        disabled={following === null || busy}
        aria-pressed={!!following}
        className={`motion-press inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-bold ${
          following
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Bell className="size-4" strokeWidth={1.9} aria-hidden="true" />
        <span>{following ? d.following : d.follow}</span>
      </button>
      {following && <p className="mt-2 text-xs text-muted-foreground">{d.followNote}</p>}
    </>
  );
}

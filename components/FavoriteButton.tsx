"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FavoriteButton({ appId, appName }: { appId: string; appName: string }) {
  const [fav, setFav] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/favorites").then((r) => {
      if (!r.ok) { setFav(false); return null; }
      return r.json();
    }).then((j) => {
      if (j) setFav((j.favorites || []).some((f: any) => f.appId === appId));
    }).catch(() => setFav(false));
  }, [appId]);

  const toggle = async () => {
    if (fav === null || busy) return;
    setBusy(true);
    const r = await fetch("/api/favorites", {
      method: fav ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId }),
    });
    if (r.status === 401) {
      router.push(`/login?next=/app/${appName}`);
      return;
    }
    if (r.ok) {
      const j = await r.json();
      setFav(j.favorited);
    }
    setBusy(false);
  };

  return (
    <Button
      variant={fav ? "destructive" : "ghost"}
      size="icon"
      onClick={toggle}
      disabled={busy || fav === null}
      aria-label={fav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      aria-pressed={!!fav}
      title={fav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className="size-12 shrink-0 rounded-full"
    >
      <Heart className="w-6 h-6" fill={fav ? "currentColor" : "none"} aria-hidden="true" />
    </Button>
  );
}

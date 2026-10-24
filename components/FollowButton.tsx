"use client";

import { useEffect, useRef, useState } from "react";
import { sparkBurst } from "@/lib/fx/spark";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FollowButton({ appId }: { appId: string }) {
  const [following, setFollowing] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/follows?appId=${appId}`)
      .then((r) => r.json())
      .then((j) => setFollowing(!!j.following))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appId]);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/follows${following ? `?appId=${appId}` : ""}`, {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: following ? undefined : JSON.stringify({ appId }),
      });
      const j = await res.json();
      if (res.ok) { setFollowing(!!j.following); if (j.following && btnRef.current) sparkBurst(btnRef.current); }
    } catch {}
    setLoading(false);
  };

  if (loading && !following) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="در حال بارگذاری" className="size-12 shrink-0 rounded-full">
        <Bell className="w-6 h-6" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      variant={following ? "default" : "ghost"}
      size="icon"
      ref={btnRef}
      onClick={toggle}
      disabled={loading}
      aria-pressed={following}
      title={following ? "لغو دنبال کردن" : "دنبال کن تا از نسخه جدید باخبر شی"}
      className="size-12 shrink-0 rounded-full"
    >
      {following ? <Bell className="w-6 h-6" aria-hidden="true" /> : <BellOff className="w-6 h-6" aria-hidden="true" />}
    </Button>
  );
}

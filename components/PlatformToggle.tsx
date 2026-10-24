"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import type { Platform } from "@/lib/store";
import { Loader2 } from "lucide-react";

const ANDROID_D = "M17.6 9.5a5.6 5.6 0 0 0-11.2 0Zm-8-3.9-1.3-2.2a.3.3 0 0 1 .5-.3l1.3 2.2a6.5 6.5 0 0 1 5.8 0l1.3-2.2a.3.3 0 0 1 .5.3l-1.3 2.2A5.6 5.6 0 0 1 17.6 9.5H6.4a5.6 5.6 0 0 1 3.2-3.9ZM9.2 8a.6.6 0 1 0 0-1.1.6.6 0 0 0 0 1.1Zm5.6 0a.6.6 0 1 0 0-1.1.6.6 0 0 0 0 1.1ZM6 10.3h12v8a1.7 1.7 0 0 1-1.7 1.7h-.9v2.4a1.3 1.3 0 0 1-2.6 0V20h-1.6v2.4a1.3 1.3 0 0 1-2.6 0V20h-.9A1.7 1.7 0 0 1 6 18.3Z";
const TUX_D = "M12 2C8 2 5 5.5 5 10c0 1.5.4 2.9 1 4.1L4 19l2.5-.7c1 .9 2.2 1.7 3.6 2.1l-.6 1.6h5l-.6-1.6c1.4-.4 2.6-1.2 3.6-2.1L20 19l-2-4.9c.6-1.2 1-2.6 1-4.1 0-4.5-3-8-7-8Zm-2.5 5.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5Zm5 0c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5ZM12 13.5c-1.2 0-2.3.5-3 1.4l-.5.6 1.8 1.3c.5-.4 1.1-.6 1.7-.6s1.2.2 1.7.6l1.8-1.3-.5-.6c-.7-.9-1.8-1.4-3-1.4Z";
const WINDOWS_D = "M3 5.5 10.5 4.4v7.1H3zM11.6 4.2 21 3v8.5h-9.4zM3 12.5h7.5v7.1L3 18.5zM11.6 12.5H21V21l-9.4-1.3z";

function PIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ITEMS: { slug: Platform; label: string; d: string }[] = [
  { slug: "android", label: "اندروید", d: ANDROID_D },
  { slug: "windows", label: "ویندوز", d: WINDOWS_D },
  { slug: "linux", label: "لینوکس", d: TUX_D },
];

export default function PlatformToggle() {
  const sp = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<Platform | null>(null);
  const current = (sp.get("platform") as Platform) || "android";

  const go = (p: Platform) => {
    if (p === current) return;
    setTarget(p);
    const params = new URLSearchParams(sp.toString());
    if (p === "android") params.delete("platform");
    else params.set("platform", p);
    params.delete("cat");
    const nav = () => startTransition(() => router.push(`/?${params.toString()}`, { scroll: false }));
    if (document.startViewTransition) document.startViewTransition(nav);
    else nav();
  };

  return (
    <div className="flex justify-center mb-6" role="tablist" aria-label="پلتفرم">
      <div className="flex items-center rounded-full p-1 gap-0.5 bg-muted">
        {ITEMS.map((p) => {
          const active = current === p.slug;
          return (
            <button
              key={p.slug}
              role="tab"
              aria-selected={active}
              title={p.label}
              aria-label={p.label}
              onClick={() => go(p.slug)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "opacity-55 hover:opacity-100"
              }`}
            >
              {pending && target === p.slug ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              ) : (
                <PIcon d={p.d} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Smooth view transitions: the wrapper re-keys on pathname change, so the
// enter animation (transform/opacity only) replays on every navigation.
// Header/footer/platform bar live outside this wrapper and never remount.
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="motion-enter">
      {children}
    </div>
  );
}

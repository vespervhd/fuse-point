"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ظاهرشدن نرم هنگام ورود به دید — با IntersectionObserver
// تأخیر پلکانی مثل نمونه: (index % 4) × 70ms
export default function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = { animationDelay: `${(index % 4) * 70}ms` } as CSSProperties;
  return (
    <div ref={ref} className={cn("fx-reveal", className)} style={style}>
      {children}
    </div>
  );
}

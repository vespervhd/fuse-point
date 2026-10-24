"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// جداکننده‌ی «جریان» — با ورود به دید، موج نور روی خط حرکت می‌کند
export default function CurrentDivider({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("lit");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("lit");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("divider-current flex-1 h-px bg-border rounded-full", className)}
    />
  );
}

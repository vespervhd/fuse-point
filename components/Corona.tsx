"use client";

// کرونای هیرو — همان طرحِ تأییدشده («تاج کسوف»)، کمی کوچک‌تر و سبک‌تر:
// ۱۲ پرتو به‌جای ۱۶، و انیمیشنِ چرخش وقتی کرونا از دید خارج شد متوقف می‌شود تا
// روی گوشی بیهوده GPU مصرف نکند. وقتی برگردد، چرخش از همان‌جا ادامه می‌یابد.
import { useEffect, useRef, useState } from "react";

export default function Corona() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const ob = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "80px",
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <div ref={ref} className={`mx-auto mb-0.5 grid place-items-center ${visible ? "" : "corona-paused"}`} aria-hidden="true">
      <svg className="corona w-[min(220px,62vw)] h-auto block" viewBox="0 0 240 240" fill="none">
        <defs>
          <line id="fp-ray" x1="120" y1="34" x2="120" y2="8" />
          <radialGradient id="fp-corona-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "var(--primary)" }} stopOpacity="0.22" />
            <stop offset="55%" style={{ stopColor: "var(--primary)" }} stopOpacity="0.07" />
            <stop offset="100%" style={{ stopColor: "var(--primary)" }} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="120" cy="120" r="112" fill="url(#fp-corona-glow)" />
        <g className="rays" style={{ stroke: "var(--primary)" }} strokeWidth="3" strokeLinecap="round" opacity="0.5">
          {rays.map((deg) => (
            <use key={deg} href="#fp-ray" transform={`rotate(${deg} 120 120)`} />
          ))}
        </g>
        <g className="orbit-a">
          <circle cx="120" cy="120" r="68" style={{ stroke: "var(--border)" }} strokeWidth="1.4" strokeDasharray="3 6" />
          <circle cx="171" cy="84" r="3" style={{ fill: "var(--primary)" }} />
          <circle cx="76" cy="158" r="2.4" style={{ fill: "var(--secondary)" }} />
        </g>
        <g className="orbit-b">
          <circle cx="120" cy="120" r="52" style={{ stroke: "var(--secondary)" }} strokeWidth="1.4" strokeDasharray="2.5 5" opacity="0.85" />
          <circle cx="157" cy="148" r="2.6" style={{ fill: "var(--primary)" }} opacity="0.9" />
        </g>
        <circle cx="120" cy="120" r="31" fill="#04050d" style={{ stroke: "var(--primary)" }} strokeWidth="2.6" />
      </svg>
    </div>
  );
}

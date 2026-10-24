import SearchBox from "./SearchBox";
import { getLocale } from "@/lib/i18n-server";

// هیرو — کرونای چرخان بزرگ بدون هیچ تیتر/متنی (عین نمونه‌ی تأییدشده) + کارت جستجو با پالس جریان
export default async function HeroSearch() {
  const locale = await getLocale();
  const rays = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <section aria-label="Fuse Point" className="pt-2 pb-1.5 text-center">
      <div className="mx-auto mb-0.5 grid place-items-center" aria-hidden="true">
        <svg className="corona w-[min(264px,74vw)] h-auto block" viewBox="0 0 240 240" fill="none">
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
      <div className="fx-current bg-card border border-border rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)] max-w-[580px] mx-auto mt-2.5 p-[7px]">
        <SearchBox compact large locale={locale} />
      </div>
    </section>
  );
}

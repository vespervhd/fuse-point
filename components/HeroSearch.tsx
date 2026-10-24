import SearchBox from "./SearchBox";

// پرتوهای تاج کسوف — عین نمونه‌ی تأییدشده
const RAYS: [number, number, number, number][] = [
  [100, 6, 100, 30], [100, 170, 100, 194], [6, 100, 30, 100], [170, 100, 194, 100],
  [34, 34, 51, 51], [149, 149, 166, 166], [166, 34, 149, 51], [51, 149, 34, 166],
  [63, 16, 74, 38], [126, 162, 137, 184], [184, 63, 162, 74], [38, 126, 16, 137],
  [137, 16, 126, 38], [74, 162, 63, 184], [16, 63, 38, 74], [162, 126, 184, 137],
];

// جست‌وجوی اصلی صفحه‌ی خانه — لوگوی کسوف با پرتوهای چرخان + کارت جستجو
export default function HeroSearch() {
  return (
    <section aria-label="جست‌وجوی سریع" className="mb-10">
      <div className="hero-logo" aria-hidden="true">
        <svg className="corona-rays" viewBox="0 0 200 200" fill="none">
          <g style={{ stroke: "var(--primary)" }} strokeWidth={1.6} strokeLinecap="round" opacity={0.75}>
            {RAYS.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
        </svg>
        <svg width={98} height={98} viewBox="0 0 40 40" fill="none">
          <circle cx={20} cy={20} r={18.5} style={{ stroke: "var(--border)" }} strokeWidth={0.8} strokeDasharray="2 3.4" />
          <circle cx={20} cy={20} r={12.5} style={{ stroke: "var(--secondary)" }} strokeWidth={0.9} strokeDasharray="1.6 3" opacity={0.85} />
          <circle cx={20} cy={20} r={7.2} fill="#04050d" style={{ stroke: "var(--primary)" }} strokeWidth={1.3} />
          <circle cx={27.5} cy={12} r={1.3} style={{ fill: "var(--primary)" }} />
          <circle cx={11} cy={26} r={1.1} style={{ fill: "var(--secondary)" }} />
          <circle cx={29} cy={25} r={1} style={{ fill: "var(--primary)" }} opacity={0.8} />
          <circle cx={14} cy={9.5} r={0.9} style={{ fill: "var(--secondary)" }} opacity={0.9} />
        </svg>
      </div>
      <div className="fx-current bg-card border border-border rounded-3xl p-5 sm:p-6 max-w-2xl mx-auto">
        <SearchBox compact large />
      </div>
    </section>
  );
}

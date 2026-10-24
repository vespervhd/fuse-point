import { useId } from "react";

// لوگوی فیوز پوینت — ستاره‌ی جرقه‌ی چهارپر + حلقه‌ی مدار باریک مایل
// نسخه‌ی گرادیانی (اصلی)، تک‌رنگ (currentColor) و ساده‌شده برای اندازه‌های ≤۲۴px (حلقه‌ی ضخیم‌تر)
const STAR_PATH =
  "M24 3 C25.9 13.8 29.8 17.7 39.6 24 C29.8 30.3 25.9 34.2 24 45 C22.1 34.2 18.2 30.3 8.4 24 C18.2 17.7 22.1 13.8 24 3 Z";

export function LogoMark({
  size = 32,
  variant = "gradient",
  className,
}: {
  size?: number;
  variant?: "gradient" | "mono";
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = `fpg-${uid}`;
  const small = size <= 24;
  const fill = variant === "mono" ? "currentColor" : `url(#${gid})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ flex: "none", display: "block" }}
    >
      {variant === "gradient" && (
        <defs>
          <linearGradient id={gid} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2dd4bf" />
            <stop offset="0.52" stopColor="#5ee8b5" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      )}
      <ellipse
        cx="24"
        cy="24"
        rx={small ? 20 : 20.5}
        ry={small ? 7.4 : 6.8}
        transform="rotate(-14 24 24)"
        fill="none"
        stroke={fill}
        strokeWidth={small ? 3 : 1.7}
      />
      <path d={STAR_PATH} fill={fill} />
    </svg>
  );
}

// وردمارک مینیمال کنار لوگو: FUSE با وزن ۵۰۰، POINT با وزن ۳۰۰، فاصله‌ی حروف باز
export function Wordmark({ size = 13.5 }: { size?: number }) {
  return (
    <span className="wordmark" style={{ fontSize: size }} aria-hidden="true">
      <span className="wm-f">Fuse</span> <span className="wm-p">Point</span>
    </span>
  );
}

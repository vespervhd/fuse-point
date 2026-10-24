"use client";

import { useState } from "react";

// آیکون برنامه با fallback یکدست: اگر آدرس نیست یا تصویر خراب/بلاک شد،
// به‌جای نمادِ «عکس خراب» یک کاشیِ حرف‌اول نشان می‌دهد.
// ‏src از قبل با (px) محاسبه می‌شود تا Buffer فقط سمتِ سرور بماند؛
// این کامپوننت فقط خطای بارگذاری را می‌گیرد و کاشی را جایگزین می‌کند.
export default function AppIcon({
  src,
  name,
  width,
  height,
  imgClassName,
  letterClassName,
  alt = "",
  eager = false,
}: {
  src: string | null | undefined;
  name: string;
  width: number;
  height: number;
  imgClassName?: string;
  letterClassName?: string;
  alt?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    const ch = (name || "?").trim().charAt(0) || "?";
    return (
      <span className={letterClassName} dir="ltr" aria-hidden="true">
        {ch}
      </span>
    );
  }
  return (
    <img
      draggable={false}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={imgClassName}
      onError={() => setFailed(true)}
    />
  );
}

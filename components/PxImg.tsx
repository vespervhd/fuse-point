"use client";

// عکس پروکسی‌شده بدون Next Image optimizer (optimizer روی /api/img خطای ۴۰۰ می‌داد).
// کامپوننت برگ (leaf) است و propهای onLoad/onError می‌پذیرد؛ هندلر رویداد DOM یعنی
// ذاتاً کلاینت است — «use client» همین‌جا الگوی درست است تا صداکننده‌های سروری بتوانند
// آن را رندر کنند و صداکننده‌های کلاینت هندلر پاس بدهند (رگرشن 2026-10-16 برعکسش بود:
// هندلر در کامپوننت سرور).
export default function PxImg({
  src, alt, width, height, className, loading = "lazy", onLoad, onError,
}: {
  src: string; alt: string; width: number; height: number; className?: string; loading?: "lazy" | "eager";
  onLoad?: () => void; onError?: () => void;
}) {
  return (
    <img
      draggable={false}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      className={className}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

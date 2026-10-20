// ریت‌لیمیت in-memory مشترک (همان الگوی قبلی لاگین/گزارش‌ها، یک‌جا).
// روی Render free تک‌اینستنس هستیم پس شمارنده‌ی حافظه‌ای کافی است؛ بعد از VPS چنداینستنس،
// باید به DB منتقل شود (اسپک بک‌اند §۱۰). سقف‌ها سخاوتمندانه‌اند تا کاربر واقعی گیر نکند.
import type { NextRequest } from "next/server";

const buckets = new Map<string, number[]>();

// آی‌پی کلاینت از هدرهای پروکسی (Render) — همان قرارداد قبلی روت‌ها
export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// اگر از سقف گذشته true برمی‌گرداند. key را اسکوپ‌دار بدهید (مثلاً `reviews:${userId}`)
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  buckets.set(key, arr);
  return arr.length > max;
}

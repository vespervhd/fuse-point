// تبدیل آدرس عکس خارجی به پروکسی داخلی — چون f-droid.org و google.com ممکن است برای کاربر قابل دسترس نباشند
// هاست‌های مجاز فقط سرویس‌های شناخته‌شده‌ی آیکن‌اند (نه پروکسیِ باز): f-droid،
// فاوآیکن گوگل، Flathub، گیت‌هاب (آواتار/فایل خام، مثل آیکن Namida) و سرویس آیکن DuckDuckGo.
// هاست‌های تک‌موردیِ سایت‌های فروشنده‌ها (ghisler، meldmerge و…) عمداً اضافه نشده‌اند؛
// آن‌ها به‌جای نمادِ خراب، کاشیِ حرف‌اول می‌گیرند.
const ALLOWED_PREFIXES = ["https://f-droid.org/", "https://www.google.com/s2/favicons", "https://dl.flathub.org/",
  "https://raw.githubusercontent.com/", "https://github.com/", "https://icons.duckduckgo.com/"];

function isAllowed(url: string): boolean {
  return ALLOWED_PREFIXES.some((p) => url.startsWith(p));
}

// اندازه‌ی آیکن در پروکسی: آیکن‌ها حداکثر با ۳۴ تا ۸۲ پیکسل نمایش داده می‌شوند،
// پس نسخه‌ی ۹۶ پیکسلی (۲ برابرِ بزرگ‌ترین نمایش + حاشیه‌ی رتینا) کافی است.
// گونه‌ی "icon" پارامتر s=96 را اضافه می‌کند؛ بقیه‌ی تصاویر (اسکرین‌شات، OG)
// بدون تغییر اندازه می‌مانند.
export const ICON_PROXY_SIZE = 96;

export function px(url: string | null | undefined, kind?: "icon"): string | null {
  if (!url) return null;
  if (!isAllowed(url)) return url; // فقط دامنه‌های مجاز پروکسی می‌شوند
  const b64 = Buffer.from(url).toString("base64url");
  return kind === "icon" ? `/api/img?u=${b64}&s=${ICON_PROXY_SIZE}` : `/api/img?u=${b64}`;
}

export function isProxiable(url: string | null | undefined): url is string {
  return !!url && isAllowed(url);
}

export function decodeProxyParam(b64: string): string | null {
  try {
    const url = Buffer.from(b64, "base64url").toString("utf8");
    return isAllowed(url) ? url : null;
  } catch {
    return null;
  }
}

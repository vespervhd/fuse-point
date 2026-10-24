// تبدیل متنِ دارای HTML (مثل توضیحات F-Droid) به متن ساده‌ی قابل‌نمایش.
// توضیحات هرگز به‌صورت HTML خام رندر نمی‌شوند؛ پس تگ‌ها حذف و موجودیت‌ها
// دیکد می‌شوند و شکست پاراگراف حفظ می‌شود. هم سمت سرور هم سمت کلاینت کار
// می‌کند (بدون DOM و بدون Buffer).

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: " ", copy: "©", reg: "®", trade: "™",
  hellip: "…", mdash: "—", ndash: "–", laquo: "«", raquo: "»",
};

export function toPlainText(input: string | null | undefined): string {
  if (!input) return "";
  let t = input;
  // شکست خط/پاراگراف قبل از حذف تگ‌ها حفظ شود
  t = t.replace(/<(br|hr)\s*\/?>/gi, "\n");
  t = t.replace(/<\/(p|div|li|tr|h[1-6]|blockquote|section|article|ul|ol)>/gi, "\n");
  t = t.replace(/<li[^>]*>/gi, "• ");
  // حذف همه‌ی تگ‌های باقی‌مانده (بدون استثنا — هیچ HTML خامی رندر نمی‌شود)
  t = t.replace(/<[^>]*>/g, "");
  // موجودیت‌های عددی (ده‌دهی و هگز)
  t = t.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => {
    const c = parseInt(h, 16);
    return c > 0 && c <= 0x10ffff ? String.fromCodePoint(c) : "";
  });
  t = t.replace(/&#(\d+);/g, (_, d) => {
    const c = parseInt(d, 10);
    return c > 0 && c <= 0x10ffff ? String.fromCodePoint(c) : "";
  });
  // موجودیت‌های نام‌دار رایج؛ ناشناخته‌ها دست‌نخورده می‌مانند
  t = t.replace(/&([a-zA-Z]+);/g, (m, n) => NAMED_ENTITIES[n] ?? m);
  // مرتب‌سازی فاصله‌ها (بدون قورت دادن خط‌های پاراگراف)
  t = t.replace(/[ \t\x0b\f\r]+/g, " ");
  t = t.replace(/\n[ ]+/g, "\n");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

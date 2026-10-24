// «جرقه» — انفجار ذره‌ای کوتاه روی کنش‌های کلیدی (دانلود، علاقه‌مندی، دنبال‌کردن)
// پیاده‌سازی عین نمونه‌ی تأییدشده: ۱۲ ذره با Web Animations، رنگ از توکن‌های تم فعال
export function sparkBurst(el: HTMLElement | null) {
  if (!el || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const cs = getComputedStyle(document.documentElement);
  const colors = [
    cs.getPropertyValue("--primary").trim(),
    cs.getPropertyValue("--secondary").trim(),
    "#ffffff",
  ];
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.style.background = colors[i % colors.length];
    s.style.left = cx + "px";
    s.style.top = cy + "px";
    document.body.appendChild(s);
    const ang = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
    const dist = 26 + Math.random() * 40;
    const anim = s.animate(
      [
        { transform: `translate(-50%,-50%) rotate(${ang}rad) translateX(0)`, opacity: 1 },
        { transform: `translate(-50%,-50%) rotate(${ang}rad) translateX(${dist}px)`, opacity: 0 },
      ],
      { duration: 420 + Math.random() * 180, easing: "cubic-bezier(.17,.67,.35,1)" }
    );
    anim.onfinish = () => s.remove();
  }
}

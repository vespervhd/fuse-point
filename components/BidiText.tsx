// نمایش درست نام‌ها و عبارت‌های لاتین وسط متن فارسی.
//
// مشکل: در یک پاراگراف راست‌به‌چپ، یک اسم لاتین (مثل Termux) یا شماره‌ی
// نسخه (مثل 0.119.0-beta.3) بدون ایزوله‌سازی، جای نقطه‌گذاری و کلمه‌های
// دورش را به‌هم می‌ریزد. راه‌حل: هر رشته‌ی لاتین در یک <bdi dir="ltr">
// ایزوله می‌شود تا الگوریتم دوزبانه‌ی مرورگر آن را یک واحد چپ‌به‌راست
// مستقل حساب کند و جمله‌ی فارسی دورش سر جای خودش بماند.
//
// این کامپوننت فقط رشته‌ی ساده می‌گیرد و با React رندر می‌کند — هیچ HTML
// خامی ساخته نمی‌شود و داده‌ی ذخیره‌شده در دیتابیس دست نمی‌خورد.
import type { ReactNode } from "react";

// حروف لاتین (با حروف توسعه‌یافته)، ارقام، و اتصال‌دهنده‌هایی که توکن‌هایی
// مثل شماره‌ی نسخه (0.119.0-beta.3) یا لایسنس (GPL-3.0-only) را به هم
// می‌چسبانند. نقطه‌گذاری فارسی (مثل «،») جزو اتصال‌دهنده نیست تا بیرون
// از bdi بماند و سر جای درست خودش بنشیند.
const LATIN_RUN =
  /[A-Za-z\u00C0-\u024F0-9]+(?:[._\-/:+][A-Za-z\u00C0-\u024F0-9]+)*/g;

export default function BidiText({ text }: { text: string }) {
  if (!text) return null;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(LATIN_RUN)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push(
      <bdi key={key++} dir="ltr">
        {m[0]}
      </bdi>,
    );
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Smartphone, Terminal, Monitor } from "lucide-react";

export const metadata: Metadata = {
  title: "راهنماهای نصب",
  description: "آموزش قدم‌به‌قدم نصب برنامه در اندروید، لینوکس و ویندوز.",
};

const guides = [
  {
    href: "/guides/install-apk",
    icon: Smartphone,
    title: "نصب APK در اندروید",
    desc: "دانلود، فعال‌سازی منابع ناشناس، و نصب امن",
  },
  {
    href: "/guides/install-linux",
    icon: Terminal,
    title: "نصب در لینوکس",
    desc: "مخزن رسمی، فلت‌هاب، یا نصب از گیت‌هاب",
  },
  {
    href: "/guides/install-windows",
    icon: Monitor,
    title: "نصب در ویندوز",
    desc: "دانلود از منبع رسمی بدون باندل تبلیغاتی",
  },
];

export default function GuidesIndex() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">راهنماهای نصب</h1>
        <p className="text-muted">قدم‌به‌قدم، به زبان ساده، برای هر سه پلتفرم.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {guides.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="bg-surface border border-border rounded-3xl p-6 text-center hover:border-primary/50 transition group"
          >
            <g.icon className="w-10 h-10 mx-auto mb-3 text-primary" aria-hidden="true" />
            <h2 className="font-extrabold mb-1 group-hover:text-primary transition-colors">{g.title}</h2>
            <p className="text-xs text-muted leading-5">{g.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

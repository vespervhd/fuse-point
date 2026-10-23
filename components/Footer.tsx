import Link from "next/link";

const mainLinks = [
  { href: "/categories", label: "دسته‌بندی‌ها" },
  { href: "/popular", label: "پرطرفدارها" },
  { href: "/latest", label: "تازه‌ها" },
  { href: "/top", label: "برترین‌ها" },
  { href: "/alternatives", label: "جایگزین‌ها" },
  { href: "/guides", label: "راهنمای نصب" },
  { href: "/how-we-verify", label: "روش بررسی ما" },
  { href: "/page/about", label: "درباره‌ی ما" },
];

const legalLinks = [
  { href: "/page/terms", label: "قوانین" },
  { href: "/page/privacy", label: "حریم خصوصی" },
];

const highlights = ["متن‌باز", "بدون تبلیغ", "بررسی‌شده"];

export default function Footer() {
  return (
    <footer className="bg-base-200 text-base-content mt-12">
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col items-center text-center">
        <img src="/icons/icon-192.png" alt="لوگوی Fuse Point" width={36} height={36} className="w-9 h-9 rounded-xl object-cover" />
        <p className="font-extrabold text-base mt-2">Fuse Point</p>
        <p className="text-xs opacity-60 mt-0.5">فروشگاه اپ‌های آزاد</p>

        <div className="flex items-center gap-2 mt-3 text-[11px] opacity-60">
          {highlights.map((h, i) => (
            <span key={h} className="flex items-center gap-2">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-current opacity-50" aria-hidden="true" />}
              {h}
            </span>
          ))}
        </div>

        <div className="divider my-6 w-full" />

        <nav aria-label="پیوندها" className="flex flex-wrap justify-center gap-x-6 gap-y-2.5">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} className="link link-hover text-[13px]">
              {l.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="حقوقی" className="flex items-center gap-3 mt-5 text-xs opacity-60">
          {legalLinks.map((l, i) => (
            <span key={l.href} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden="true">|</span>}
              <Link href={l.href} className="link link-hover">{l.label}</Link>
            </span>
          ))}
        </nav>

        <p className="text-[11px] opacity-40 mt-4">© ۱۴۰۵ Fuse Point</p>
      </div>
    </footer>
  );
}

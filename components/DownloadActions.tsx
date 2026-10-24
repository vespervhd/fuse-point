"use client";

import { Globe } from "lucide-react";
import { formatBytes, toFaDigits } from "@/lib/fa";

// ─── آیکون‌های برند (اینلاین، بدون وابستگی) ───
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const AndroidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.6 9.5a5.6 5.6 0 0 0-11.2 0Zm-8-3.9-1.3-2.2a.3.3 0 0 1 .5-.3l1.3 2.2a6.5 6.5 0 0 1 5.8 0l1.3-2.2a.3.3 0 0 1 .5.3l-1.3 2.2A5.6 5.6 0 0 1 17.6 9.5H6.4a5.6 5.6 0 0 1 3.2-3.9ZM9.2 8a.6.6 0 1 0 0-1.1.6.6 0 0 0 0 1.1Zm5.6 0a.6.6 0 1 0 0-1.1.6.6 0 0 0 0 1.1ZM6 10.3h12v8a1.7 1.7 0 0 1-1.7 1.7h-.9v2.4a1.3 1.3 0 0 1-2.6 0V20h-1.6v2.4a1.3 1.3 0 0 1-2.6 0V20h-.9A1.7 1.7 0 0 1 6 18.3Z" />
  </svg>
);

// ─── تایپ‌ها ───
export type DownloadAppInfo = {
  platform: string;
  githubRepo?: string | null;
  githubStars?: number | null;
  sourceUrl?: string | null;
  sourceType?: string | null;
  version?: {
    id: string;
    versionName: string;
    fileSize: number | null;
    fileType: string;
    fileUrl?: string | null;
  } | null;
  // true یعنی version در واقع جدیدترین نسخه‌ی در انتظار بازبینی است (نه نسخه‌ی فعال)
  pending?: boolean;
};

type Option = {
  key: string;
  label: string;
  sub: string;
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
  external?: boolean;
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

// ─── منطق هوشمند ساخت گزینه‌ها ───
// قانون مالک (تأیید مجدد ۲۰۲۶-۱۰-۲۴): مقصد هر پلتفرم جدا حساب می‌شود —
// اول فایل مستقیم رسمی (از مسیر ترکینگ داخلی)، بعد وب‌سایت رسمی پروژه
// (اپی که فقط وب‌سایت دارد به همان وب‌سایت می‌رود)، و در نبودش گیت‌هاب
// (اگر وب‌سایت جدا هست: خود ریپو؛ وگرنه صفحه‌ی ریلیزها).
export function getDownloadOptions(app: DownloadAppInfo): Option[] {
  const out: Option[] = [];
  const v = app.version;
  const sHost = app.sourceUrl ? hostOf(app.sourceUrl) : "";
  const isGithubUrl = sHost === "github.com";
  const hasSeparateWebsite = !!app.sourceUrl && !isGithubUrl && app.sourceType !== "fdroid";

  // ۱) فایل مستقیم این پلتفرم — از /api/download (ثبت رویداد + ریدایرکت به فایل واقعی)
  if (v && v.fileType !== "external" && v.fileUrl) {
    out.push({
      key: "apk",
      label: `دانلود نسخه ${v.versionName}`,
      sub: v.fileSize ? formatBytes(v.fileSize) : "دانلود مستقیم",
      href: `/api/download/${v.id}`,
      icon: <AndroidIcon className="w-5 h-5" />,
      primary: true,
    });
  }

  // ۲) نسخه‌ی external — لینک به همان صفحه‌ی رسمی دانلود
  if (v && v.fileType === "external" && v.fileUrl && out.length === 0) {
    out.push({
      key: "fdroid",
      label: "دانلود",
      sub: "صفحه‌ی رسمی دانلود",
      href: v.fileUrl,
      icon: <AndroidIcon className="w-5 h-5" />,
      primary: true,
      external: true,
    });
  }

  // ۳) وب‌سایت رسمی پروژه (بیرون گیت‌هاب) — قبل از گیت‌هاب می‌آید
  if (hasSeparateWebsite && app.sourceUrl) {
    out.push({
      key: "web",
      label: "صفحه رسمی پروژه",
      sub: sHost || "وب‌سایت رسمی",
      href: app.sourceUrl,
      icon: <Globe className="w-5 h-5" aria-hidden="true" />,
      primary: out.length === 0,
      external: true,
    });
  }

  // ۴) گیت‌هاب — با وب‌سایت جدا: خود ریپو؛ بدون آن: ریلیزها
  if (app.githubRepo) {
    out.push({
      key: "github",
      label: "مشاهده در گیت‌هاب",
      sub:
        app.githubStars && app.githubStars > 0
          ? `${toFaDigits(app.githubStars)} استار · ${app.githubRepo}`
          : app.githubRepo,
      href: hasSeparateWebsite
        ? `https://github.com/${app.githubRepo}`
        : `https://github.com/${app.githubRepo}/releases`,
      icon: <GithubIcon className="w-5 h-5" />,
      primary: out.length === 0,
      external: true,
    });
  } else if (isGithubUrl && app.sourceUrl) {
    // منبع، خود گیت‌هاب است ولی githubRepo جدا ثبت نشده
    const m = app.sourceUrl.match(/github\.com\/([^\/]+\/[^\/\#\?]+)/);
    if (m) {
      out.push({
        key: "github",
        label: "مشاهده در گیت‌هاب",
        sub: m[1],
        href: `https://github.com/${m[1]}/releases`,
        icon: <GithubIcon className="w-5 h-5" />,
        primary: out.length === 0,
        external: true,
      });
    }
  }

  // حذف تکراری‌ها
  return out.filter((o, i) => out.findIndex((x) => x.href === o.href) === i);
}

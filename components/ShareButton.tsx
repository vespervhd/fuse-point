"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ appName, slug }: { appName: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const doCopyFallback = (url: string) => {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch { /* نادیده */ }
    document.body.removeChild(ta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    const url = `${window.location.origin}/app/${slug}`;
    const text = `«${appName}» در Fuse Point — فروشگاه اپ‌های آزاد`;
    if (navigator.share) {
      try {
        await navigator.share({ title: appName, text, url });
      } catch {
        /* کاربر پنجره‌ی اشتراک را بست */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      doCopyFallback(url);
    }
  };

  return (
    <button
      onClick={share}
      aria-label="اشتراک‌گذاری"
      title={copied ? "لینک کپی شد" : "اشتراک‌گذاری"}
      className="btn btn-ghost btn-circle shrink-0"
    >
      {copied ? (
        <Check className="w-6 h-6 text-green-500" aria-hidden="true" />
      ) : (
        <Share2 className="w-6 h-6" aria-hidden="true" />
      )}
    </button>
  );
}

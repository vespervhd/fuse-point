"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// بلوک هش SHA-256 — جهت «ج»: پنل موبرگی، مقدار مونو و دکمه‌ی کپی
export default function HashBlock({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="border border-border bg-surface rounded-lg p-3">
      <p className="font-mono text-[10.5px] leading-[1.8] text-fg/85 break-all" dir="ltr" style={{ textAlign: "left" }}>
        {hash}
      </p>
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[11.5px] text-muted">هش SHA-256 فایل نصب</span>
        <button
          onClick={copy}
          className="font-mono text-[10.5px] border border-border rounded px-2.5 py-1 hover:border-primary hover:text-primary transition-colors inline-flex items-center gap-1.5"
          aria-label="کپی هش"
        >
          {copied
            ? <Check className="w-3.5 h-3.5" aria-hidden="true" />
            : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
    </div>
  );
}

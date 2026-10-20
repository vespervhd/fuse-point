"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, History } from "lucide-react";
import { toFaDigits, formatBytesEn, formatDate } from "@/lib/fa";

type Version = {
  id: string;
  versionName: string | null;
  publishedAt: Date | string | null;
  createdAt: Date | string | null;
  fileSize: number | null;
};

export default function VersionsDrawer({ versions }: { versions: Version[] }) {
  const [open, setOpen] = useState(false);

  if (versions.length <= 1) return null;

  return (
    <section className="bg-surface border border-border rounded-lg overflow-hidden" aria-label="نسخه‌های قبلی">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-extrabold">
          <History className="w-5 h-5 text-primary" />
          نسخه‌های قبلی
          <span className="font-mono text-[10.5px] font-normal text-muted bg-surface-2 border border-border rounded px-1.5 py-px">
            {toFaDigits(versions.length - 1)}
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="px-4 pb-4 space-y-2">
          {versions.slice(1).map((ver) => (
            <li
              key={ver.id}
              className="flex items-center justify-between gap-3 border border-border rounded-lg px-3.5 py-2.5 text-sm"
            >
              <span className="font-mono font-medium text-[12px]" dir="ltr">
                v{ver.versionName ?? "?"}
              </span>
              <span className="text-muted text-xs inline-flex items-center gap-1.5">
                {formatDate(ver.publishedAt || ver.createdAt)}
                <span className="font-mono text-[10.5px]" dir="ltr">{formatBytesEn(ver.fileSize)}</span>
              </span>
              <Link
                href={`/api/download/${ver.id}`}
                className="text-primary font-bold text-xs hover:underline shrink-0"
              >
                دانلود
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

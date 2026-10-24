"use client";
import { useState } from "react";
import { Download, Package, Link2, Check } from "lucide-react";
import { formatBytes } from "@/lib/fa";
import { Button } from "@/components/ui/button";

export default function DownloadButton({
  versionId, versionName, fileSize,
}: {
  versionId: string; versionName: string; fileSize: number | null;
}) {
  const [copied, setCopied] = useState(false);
  const url = `/api/download/${versionId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <a
        href={url}
        className="flex-1 bg-primary text-primary-foreground text-center font-extrabold text-lg py-4 rounded-2xl hover:opacity-90 active:scale-[0.99] transition shadow-lg shadow-primary/20 inline-flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" aria-hidden="true" /> دانلود نسخه <span dir="ltr">{versionName}</span>
      </a>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="bg-muted rounded-lg px-3 py-2 inline-flex items-center gap-1.5"><Package className="w-4 h-4" aria-hidden="true" /> {formatBytes(fileSize)}</span>
        <Button onClick={copy} variant="ghost" size="sm" aria-label="کپی لینک دانلود">
          {copied ? <><Check className="w-4 h-4" aria-hidden="true" /> کپی شد!</> : <><Link2 className="w-4 h-4" aria-hidden="true" /> کپی لینک</>}
        </Button>
      </div>
      </div>
  );
}

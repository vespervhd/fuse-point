"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DownloadSheet, { type DownloadOption } from "./DownloadSheet";
import { getDownloadOptions, type DownloadAppInfo } from "./DownloadActions";

type Props = {
  app: DownloadAppInfo;
  appName: string;
  iconUrl: string | null;
  sha256: string | null;
};

// دکمه‌ی دانلود که باتم‌شیت را باز می‌کند — با همان منطق هوشمند DownloadActions
export default function DownloadTrigger({ app, appName, iconUrl, sha256 }: Props) {
  const [open, setOpen] = useState(false);
  const opts = getDownloadOptions(app);
  const versionName = app.version?.versionName ?? null;
  const fileSize = app.version?.fileSize ?? null;

  const sourceLabel = app.githubRepo
    ? "گیت‌هاب"
    : app.sourceType === "fdroid"
      ? "F-Droid"
      : "وب‌سایت رسمی";

  const sheetOptions: DownloadOption[] = opts.map((o) => ({
    label: o.label,
    href: o.href,
    external: o.external,
    detail: o.sub,
  }));

  if (!opts.length) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="w-full"
      >
        <Download className="w-5 h-5" aria-hidden="true" />
        دانلود
        {versionName && <span dir="ltr" className="opacity-80 text-sm">{versionName}</span>}
      </Button>
      <DownloadSheet
        open={open}
        onClose={() => setOpen(false)}
        appName={appName}
        iconUrl={iconUrl}
        versionName={versionName}
        fileSize={fileSize}
        sha256={sha256}
        sourceLabel={sourceLabel}
        options={sheetOptions}
      />
    </>
  );
}

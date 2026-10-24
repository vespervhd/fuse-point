"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, History } from "lucide-react";
import { toFaDigits, formatBytes, formatDate } from "@/lib/fa";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    <Sheet open={open} onOpenChange={setOpen}>
      <section className="bg-card border border-border rounded-3xl overflow-hidden" aria-label="نسخه‌های قبلی">
        <SheetTrigger asChild>
          <button
            className="flex w-full items-center justify-between px-6 py-4 transition hover:bg-accent hover:text-accent-foreground"
          >
            <span className="flex items-center gap-2 font-extrabold">
              <History className="w-5 h-5 text-primary" />
              نسخه‌های قبلی
              <Badge variant="secondary" className="rounded-full font-normal">
                {toFaDigits(versions.length - 1)}
              </Badge>
            </span>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
        </SheetTrigger>
      </section>

      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto px-6 pb-8">
        <SheetHeader className="px-0">
          <SheetTitle className="flex items-center gap-2 font-extrabold">
            <History className="w-5 h-5 text-primary" />
            نسخه‌های قبلی
            <Badge variant="secondary" className="rounded-full font-normal">
              {toFaDigits(versions.length - 1)}
            </Badge>
          </SheetTitle>
          <SheetDescription className="sr-only">فهرست نسخه‌های قبلی برای دانلود</SheetDescription>
        </SheetHeader>
        <ul className="space-y-2">
          {versions.slice(1).map((ver) => (
            <li
              key={ver.id}
              className="flex items-center justify-between gap-3 bg-muted rounded-xl px-4 py-3 text-sm"
            >
              <span className="font-bold" dir="ltr">
                v{ver.versionName ?? "?"}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatDate(ver.publishedAt || ver.createdAt)} • {formatBytes(ver.fileSize)}
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
      </SheetContent>
    </Sheet>
  );
}

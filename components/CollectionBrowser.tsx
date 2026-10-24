"use client";

import Link from "next/link";
import { toFaDigits } from "@/lib/fa";
import {
  MessageCircle, Gamepad2, Zap, Clapperboard, ShieldCheck,
  Sparkles, Code2, FolderOpen, ChevronLeft, type LucideIcon,
} from "lucide-react";

type Col = { id: string; slug: string; nameFa: string; appCount?: number };

// آیکون متمایز هر مجموعه بر اساس کلیدواژه‌ی اسم
function colIcon(nameFa: string): LucideIcon {
  const n = nameFa;
  if (n.includes("پیام‌رسان") || n.includes("پیامرسان")) return MessageCircle;
  if (n.includes("بازی")) return Gamepad2;
  if (n.includes("بهره‌وری") || n.includes("بهرهوری")) return Zap;
  if (n.includes("سرگرمی") || n.includes("رسانه") || n.includes("موسیقی") || n.includes("چندرسانه")) return Clapperboard;
  if (n.includes("خصوصی") || n.includes("حریم") || n.includes("امنیت")) return ShieldCheck;
  if (n.includes("ضروری") || n.includes("منتخب") || n.includes("پیشنهاد")) return Sparkles;
  if (n.includes("توسعه") || n.includes("برنامه‌نویس") || n.includes("کدنویسی")) return Code2;
  return FolderOpen;
}

// مجموعه‌ها — لیست فشرده
export default function CollectionBrowser({
  collections,
  platform,
}: {
  collections: Col[];
  platform?: string;
}) {
  if (!collections.length) return null;

  return (
    <section aria-label="مجموعه‌ها" className="mb-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base font-extrabold">مجموعه‌ها</h2>
        <Link
          href={`/collections${platform && platform !== "android" ? `?platform=${platform}` : ""}`}
          className="text-xs text-primary font-bold hover:underline"
        >
          همه
        </Link>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <ul className="divide-y divide-border/60">
          {collections.map((c) => {
            const Icon = colIcon(c.nameFa);
            return (
              <li key={c.id}>
                <Link
                  href={`/collection/${c.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition"
                >
                  <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-sm truncate">{c.nameFa}</span>
                    <span className="block text-[11px] opacity-50">{toFaDigits(c.appCount ?? 0)} اپ</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 opacity-40 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

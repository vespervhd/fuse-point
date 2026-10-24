"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { STR, type Locale } from "@/lib/i18n";

// آیکن علاقه‌مندی هدر — وقتی کاربر چیزی نشان کرده باشد پر می‌شود (عین نمونه)
export default function FavHeaderButton({ locale = "fa" }: { locale?: Locale }) {
  const [has, setHas] = useState(false);
  const d = STR[locale];

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : { favorites: [] }))
      .then((j) => setHas((j.favorites || []).length > 0))
      .catch(() => {});
  }, []);

  return (
    <Link href="/favorites" aria-label={d.favs} className={`hdr-icon-btn${has ? " faved" : ""}`}>
      <Bookmark className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
    </Link>
  );
}

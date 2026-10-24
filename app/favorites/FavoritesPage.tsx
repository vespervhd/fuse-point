"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppCard from "@/components/AppCard";
import { Heart, Lock } from "lucide-react";

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "done">("loading");

  useEffect(() => {
    fetch("/api/favorites").then((r) => {
      if (r.status === 401) { setState("denied"); return null; }
      return r.json();
    }).then((j) => {
      if (j) { setItems(j.favorites || []); setState("done"); }
    }).catch(() => setState("done"));
  }, []);

  if (state === "loading") {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-32 border border-border rounded-2xl" />)}
    </div>;
  }

  if (state === "denied") {
    return (
      <div className="bg-card border border-border rounded-3xl p-10 text-center max-w-md mx-auto">
        <Lock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
        <p className="font-extrabold mb-1">وارد نشده‌اید</p>
        <p className="text-sm text-muted-foreground mb-4">برای دیدن علاقه‌مندی‌ها وارد حساب شوید.</p>
        <Link href="/login" className="inline-block bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl">ورود</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" fill="currentColor" aria-hidden="true" /> علاقه‌مندی‌های من
      </h1>
      {items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((a: any, i: number) => (
            <AppCard key={a.appId} index={i} app={{
              id: a.appId, slug: a.slug, nameFa: a.nameFa, nameEn: a.nameEn,
              iconUrl: a.iconUrl, shortDesc: a.shortDesc, shortDescFa: a.shortDescFa, versionName: null, downloadCount: 0, githubStars: a.githubStars ?? null,
            }} />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl p-10 text-center">
          <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
          <p className="font-bold mb-1">هنوز چیزی ذخیره نکرده‌اید</p>
          <p className="text-sm text-muted-foreground">روی قلب هر برنامه بزنید تا اینجا ذخیره شود.</p>
        </div>
      )}
    </div>
  );
}

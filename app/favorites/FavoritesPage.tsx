"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Lock } from "lucide-react";
import AppRow from "@/components/AppRow";
import { BackLink, ViewHead, EmptyState } from "@/components/Bits";
import { STR, type Locale } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

type Fav = {
  appId: string; slug: string; nameFa: string; nameEn: string;
  iconUrl: string | null; shortDesc: string | null; shortDescFa: string | null;
  platform: string;
};

// نمای علاقه‌مندی‌ها — ردیف‌های ادیتوریال نشان‌شده‌ها، در فضای پلتفرم فعال (از API واقعی حساب)
export default function FavoritesPage({ locale, platform }: { locale: Locale; platform: Platform }) {
  const d = STR[locale];
  const [items, setItems] = useState<Fav[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "done">("loading");
  const qs = platform === "android" ? "" : `?platform=${platform}`;

  useEffect(() => {
    fetch("/api/favorites").then((r) => {
      if (r.status === 401) { setState("denied"); return null; }
      return r.json();
    }).then((j) => {
      if (j) { setItems(j.favorites || []); setState("done"); }
    }).catch(() => setState("done"));
  }, []);

  const shown = items.filter((a) => a.platform === platform);

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead title={d.favs} sub={d.favsSub} />

      {state === "loading" && (
        <div className="space-y-2" aria-hidden="true">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-[76px] border border-border rounded-xl" />)}
        </div>
      )}

      {state === "denied" && (
        <div className="bg-card border border-border rounded-3xl p-10 text-center max-w-md mx-auto">
          <Lock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
          <p className="font-extrabold mb-1">{locale === "fa" ? "وارد نشده‌ای" : "You're not signed in"}</p>
          <p className="text-sm text-muted-foreground mb-4">{locale === "fa" ? "برای دیدن نشان‌شده‌ها وارد حساب شو." : "Sign in to see your bookmarks."}</p>
          <Link href="/login?next=/favorites" className="inline-block bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl">
            {locale === "fa" ? "ورود" : "Sign in"}
          </Link>
        </div>
      )}

      {state === "done" && (shown.length ? (
        <div className="border-t border-border">
          {shown.map((a, i) => (
            <AppRow
              key={a.appId}
              app={{ id: a.appId, slug: a.slug, nameFa: a.nameFa, nameEn: a.nameEn, iconUrl: a.iconUrl, platform: a.platform }}
              locale={locale}
              platform={platform}
              index={i}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" aria-hidden="true" />}
          text={items.length ? d.emptyHome : d.favsEmpty}
          sub={items.length ? d.tryAnotherPlatform : d.favsEmptySub}
        />
      ))}
    </div>
  );
}

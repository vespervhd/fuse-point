"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STR, num, dateL, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type App = {
  id: string; slug: string; packageName: string;
  nameFa: string; nameEn: string; isPublished: boolean;
  featured: boolean; updatedAt: string; versionCount: number;
};

export default function AppsList({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const [apps, setApps] = useState<App[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/apps").then((r) => r.json()).then((j) => {
      setApps(j.apps || []); setLoading(false);
    });
  }, []);

  const filtered = apps.filter((a) =>
    !q || a.nameFa.includes(q) || a.nameEn.toLowerCase().includes(q.toLowerCase()) || a.packageName.includes(q)
  );

  const unpublish = async (id: string) => {
    if (!confirm(d.adm_unpublishConfirm)) return;
    await fetch(`/api/admin/apps/${id}`, { method: "DELETE" });
    setApps((p) => p.map((a) => a.id === id ? { ...a, isPublished: false } : a));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-extrabold">{d.adm_navApps} ({num(apps.length, locale)})</h1>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.adm_searchPh}
            className="h-10 w-48" />
          <Button asChild className="h-10 px-5 font-bold">
            <Link href="/admin/apps/new">{d.adm_new}</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl border border-border" />))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <ul className="divide-y divide-border">
            {filtered.map((a) => (
              <li key={a.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition">
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">
                    {a.nameFa}
                    {!a.isPublished && <Badge variant="warning" className="ms-2 font-normal">{d.adm_draft}</Badge>}
                    {a.featured && <span className="text-xs text-primary font-normal ms-2">⭐</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" dir="ltr" style={{ textAlign: "right" }}>
                    {a.packageName} • {d.adm_verCount.replace("{n}", num(a.versionCount, locale))} • {dateL(a.updatedAt, locale)}
                  </p>
                </div>
                <Link href={`/admin/apps/${a.id}`}
                  className="text-sm text-primary font-bold hover:underline shrink-0">{d.adm_edit}</Link>
                {a.isPublished && (
                  <Button variant="destructive" size="sm" onClick={() => unpublish(a.id)}
                    className="shrink-0">{d.adm_unpublish}</Button>
                )}
              </li>
            ))}
          </ul>
          {!filtered.length && <p className="p-10 text-center text-muted-foreground text-sm">{d.adm_notFound}</p>}
        </div>
      )}
    </div>
  );
}

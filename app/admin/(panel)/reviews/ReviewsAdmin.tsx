"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STR, dateL, type Locale, type Dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type Review = {
  id: string; rating: number; text: string | null; status: string;
  createdAt: string; userName: string | null; appName: string; appSlug: string;
};

const statusLabel = (d: Dict, status: string): string | undefined => {
  if (status === "pending") return d.adm_statusPending;
  if (status === "approved") return d.adm_statusApproved;
  if (status === "rejected") return d.adm_statusRejected;
  return undefined;
};

export default function ReviewsAdmin({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState("pending");

  const load = () => fetch("/api/admin/reviews").then((r) => r.json()).then((j) => setReviews(j.reviews || []));
  useEffect(() => { load(); }, []);

  const act = async (id: string, method: string, body?: any) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method, headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    load();
  };

  const list = reviews.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="text-2xl font-extrabold mb-6">{d.adm_reviewsTitle}</h1>
      <div className="flex gap-2 mb-6">
        {[["pending", d.adm_statusPending], ["approved", d.adm_statusApproved], ["rejected", d.adm_statusRejected], ["all", d.allCats]].map(([k, l]) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "ghost"} onClick={() => setFilter(k)}>{l}</Button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-3xl p-5">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <p className="font-bold text-sm">
                <Link href={`/app/${r.appSlug}`} className="text-primary hover:underline">{r.appName}</Link>
                <span className="text-muted-foreground font-normal ms-2">{"⭐".repeat(r.rating)} — {r.userName} [{statusLabel(d, r.status)}]</span>
              </p>
              <span className="text-xs text-muted-foreground">{dateL(r.createdAt, locale)}</span>
            </div>
            {r.text && <p className="text-sm leading-7 mb-3">{r.text}</p>}
            <div className="flex gap-2 text-xs">
              {r.status !== "approved" && (
                <Button size="sm" onClick={() => act(r.id, "PATCH", { status: "approved" })}>{d.adm_approve}</Button>
              )}
              {r.status !== "rejected" && (
                <Button variant="ghost" size="sm" onClick={() => act(r.id, "PATCH", { status: "rejected" })}>{d.adm_reject}</Button>
              )}
              <Button variant="destructive" size="sm" onClick={() => { if (confirm(d.adm_confirmDelete)) act(r.id, "DELETE"); }}>{d.adm_delete}</Button>
            </div>
          </div>
        ))}
        {!list.length && <p className="text-center text-muted-foreground text-sm bg-card border border-border rounded-3xl p-10">{d.adm_noReviews}</p>}
      </div>
    </div>
  );
}

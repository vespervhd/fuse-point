"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STR, dateL, type Locale, type Dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type Report = {
  id: string; type: string; message: string; status: string;
  createdAt: string; appName: string; appSlug: string;
};

const typeLabel = (d: Dict, type: string): string | undefined => {
  if (type === "broken_link") return d.adm_repType_broken_link;
  if (type === "wrong_info") return d.adm_repType_wrong_info;
  if (type === "malware_suspicion") return d.adm_repType_malware_suspicion;
  if (type === "bad_translation") return d.adm_repType_bad_translation;
  if (type === "other") return d.adm_repType_other;
  return undefined;
};
const statusLabel = (d: Dict, status: string): string | undefined => {
  if (status === "open") return d.adm_filterOpen;
  if (status === "in_review") return d.adm_statusInReview;
  if (status === "resolved") return d.adm_filterResolved;
  if (status === "dismissed") return d.adm_statusDismissed;
  return undefined;
};

export default function ReportsAdmin({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("open");

  const load = () => fetch("/api/admin/reports").then((r) => r.json()).then((j) => setReports(j.reports || []));
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const list = reports.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="text-2xl font-extrabold mb-6">{d.adm_reportsTitle}</h1>
      <div className="flex gap-2 mb-6">
        {[["open", d.adm_filterOpen], ["in_review", d.adm_statusInReview], ["resolved", d.adm_filterResolved], ["dismissed", d.adm_statusDismissed], ["all", d.allCats]].map(([k, l]) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "ghost"} onClick={() => setFilter(k)}>{l}</Button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-3xl p-5">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <p className="font-bold">
                <Link href={`/app/${r.appSlug}`} className="text-primary hover:underline">{r.appName}</Link>
                <span className="text-xs font-normal text-muted-foreground ms-2">[{typeLabel(d, r.type)}] [{statusLabel(d, r.status)}]</span>
              </p>
              <span className="text-xs text-muted-foreground">{dateL(r.createdAt, locale)}</span>
            </div>
            <p className="text-sm leading-7 mb-3">{r.message}</p>
            <div className="flex gap-2 text-xs">
              {r.status === "open" && <Button variant="ghost" size="sm" onClick={() => setStatus(r.id, "in_review")}>{d.adm_reviewBtn}</Button>}
              {r.status !== "resolved" && <Button size="sm" onClick={() => setStatus(r.id, "resolved")}>{d.adm_resolvedBtn}</Button>}
              {r.status !== "dismissed" && <Button variant="destructive" size="sm" onClick={() => setStatus(r.id, "dismissed")}>{d.adm_reject}</Button>}
            </div>
          </div>
        ))}
        {!list.length && <p className="text-center text-muted-foreground text-sm bg-card border border-border rounded-3xl p-10">{d.adm_noReports}</p>}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/fa";
import { Button } from "@/components/ui/button";

type Report = {
  id: string; type: string; message: string; status: string;
  createdAt: string; appName: string; appSlug: string;
};

const TYPE_FA: Record<string, string> = {
  broken_link: "لینک خراب", wrong_info: "اطلاعات نادرست",
  malware_suspicion: "ظن بدافزار", other: "سایر",
};
const STATUS_FA: Record<string, string> = {
  open: "باز", in_review: "در حال بررسی", resolved: "حل‌شده", dismissed: "ردشده",
};

export default function ReportsAdmin() {
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
      <h1 className="text-2xl font-extrabold mb-6">گزارش‌های کاربران</h1>
      <div className="flex gap-2 mb-6">
        {[["open", "باز"], ["in_review", "در حال بررسی"], ["resolved", "حل‌شده"], ["dismissed", "ردشده"], ["all", "همه"]].map(([k, l]) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "ghost"} onClick={() => setFilter(k)}>{l}</Button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-3xl p-5">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <p className="font-bold">
                <Link href={`/app/${r.appSlug}`} className="text-primary hover:underline">{r.appName}</Link>
                <span className="text-xs font-normal text-muted-foreground ms-2">[{TYPE_FA[r.type]}] [{STATUS_FA[r.status]}]</span>
              </p>
              <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
            </div>
            <p className="text-sm leading-7 mb-3">{r.message}</p>
            <div className="flex gap-2 text-xs">
              {r.status === "open" && <Button variant="ghost" size="sm" onClick={() => setStatus(r.id, "in_review")}>بررسی</Button>}
              {r.status !== "resolved" && <Button size="sm" onClick={() => setStatus(r.id, "resolved")}>حل شد</Button>}
              {r.status !== "dismissed" && <Button variant="destructive" size="sm" onClick={() => setStatus(r.id, "dismissed")}>رد</Button>}
            </div>
          </div>
        ))}
        {!list.length && <p className="text-center text-muted-foreground text-sm bg-card border border-border rounded-3xl p-10">گزارشی وجود ندارد.</p>}
      </div>
    </div>
  );
}

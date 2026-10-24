"use client";
import { useEffect, useState } from "react";
import { STR, num, dateL, type Locale, type Dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type Err = {
  id: string; fingerprint: string; kind: string; message: string;
  stack: string | null; url: string | null; count: number; status: string;
  firstSeenAt: string; lastSeenAt: string;
};

const kindLabel = (d: Dict, kind: string): string => {
  if (kind === "client") return d.adm_kindClient;
  if (kind === "server") return d.adm_kindServer;
  if (kind === "api") return "API";
  return kind;
};

export default function ErrorsAdmin({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const [errors, setErrors] = useState<Err[]>([]);
  const [filter, setFilter] = useState("open");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () =>
    fetch("/api/admin/errors")
      .then((r) => r.json())
      .then((j) => setErrors(j.errors || []));
  useEffect(() => { load(); }, []);

  const act = async (id: string, method: string, body?: object) => {
    await fetch(`/api/admin/errors/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    load();
  };

  const list = errors.filter((e) => filter === "all" || e.status === filter);
  const openCount = errors.filter((e) => e.status === "open").length;

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="text-2xl font-extrabold mb-2">{d.adm_navErrors}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {openCount > 0 ? (
          <><span className="font-bold text-destructive">{num(openCount, locale)}</span> {d.adm_errOpenNote}</>
        ) : (
          d.adm_errAllClean
        )}
      </p>

      <div className="flex gap-2 mb-6">
        {[["open", d.adm_filterOpen], ["resolved", d.adm_filterResolved], ["all", d.allCats]].map(([k, l]) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "ghost"} onClick={() => setFilter(k)}>{l}</Button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((e) => (
          <div key={e.id} className="bg-card border border-border rounded-3xl p-5">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <p className="font-bold text-sm">
                <span className="text-xs font-normal text-muted-foreground ms-2">
                  [{kindLabel(d, e.kind)}] ×{num(e.count, locale)}
                </span>
              </p>
              <span className="text-xs text-muted-foreground">{dateL(e.lastSeenAt, locale)}</span>
            </div>
            <p className="text-sm leading-7 mb-1 break-words" dir="auto">{e.message}</p>
            {e.url && (
              <p className="text-xs text-muted-foreground mb-3 break-all" dir="ltr">{e.url}</p>
            )}
            {expanded === e.id && e.stack && (
              <pre className="text-[11px] leading-5 bg-muted rounded-xl p-3 mb-3 overflow-x-auto whitespace-pre-wrap break-words" dir="ltr">
                {e.stack}
              </pre>
            )}
            <div className="flex gap-2 text-xs">
              {e.stack && (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                >
                  {expanded === e.id ? d.adm_hideStack : d.adm_showStack}
                </Button>
              )}
              {e.status === "open" ? (
                <Button
                  size="sm"
                  onClick={() => act(e.id, "PATCH", { status: "resolved" })}
                >
                  {d.adm_resolvedBtn}
                </Button>
              ) : (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => act(e.id, "PATCH", { status: "open" })}
                >
                  {d.adm_reopen}
                </Button>
              )}
              <Button
                variant="destructive" size="sm"
                onClick={() => { if (confirm(d.adm_confirmDelete)) act(e.id, "DELETE"); }}
              >
                {d.adm_delete}
              </Button>
            </div>
          </div>
        ))}
        {!list.length && (
          <p className="text-center text-muted-foreground text-sm bg-card border border-border rounded-3xl p-10">
            {d.adm_noErrors}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BellOff, BellRing, CheckCheck } from "lucide-react";
import { BackLink, ViewHead, EmptyState } from "@/components/Bits";
import { STR, dateL, type Locale } from "@/lib/i18n";

type Notif = {
  id: string; title: string; message: string | null; isRead: boolean;
  createdAt: string; appSlug: string | null; versionName: string | null;
};

// نمای اعلان‌ها — کارت‌های نمونه؛ خوانده‌شدن با API واقعی اعلان‌ها
export default function NotificationsPage({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await fetch("/api/notifications");
      if (r.ok) setItems((await r.json()).items || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
    setItems((xs) => xs.map((x) => ({ ...x, isRead: true })));
  };
  const markOne = async (id: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
  };

  return (
    <div className="animate-fade-up">
      <BackLink href="/" label={d.backStore} />
      <ViewHead title={d.notifications} sub={d.notifSub} />

      {loading ? (
        <div className="space-y-2" aria-hidden="true">
          {[1, 2].map((i) => <div key={i} className="skeleton h-[74px] border border-border rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BellOff className="w-6 h-6" aria-hidden="true" />}
          text={d.notifsEmpty}
          sub={d.notifsEmptySub}
        />
      ) : (
        <>
          {items.some((x) => !x.isRead) && (
            <div className="mb-3.5">
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary border border-border bg-card rounded-full px-4 py-2 min-h-[40px]"
              >
                <CheckCheck className="w-4 h-4" aria-hidden="true" />
                {d.markAllRead}
              </button>
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            {items.map((n) => (
              <article
                key={n.id}
                className={`flex gap-3 bg-card border rounded-[18px] p-4 ${n.isRead ? "border-border opacity-75" : "border-primary/40"}`}
              >
                <span className="w-[46px] h-[46px] shrink-0 rounded-[13px] grid place-items-center text-primary bg-primary/10 border border-primary/[0.22]">
                  <BellRing className="w-[22px] h-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[14.5px] m-0 leading-[1.7]">{n.title}</p>
                  {n.message && <p className="text-muted-foreground text-[13px] mt-0.5 m-0 leading-[1.8]">{n.message}</p>}
                  <p className="text-muted-foreground text-xs mt-1.5 m-0">{dateL(n.createdAt, locale)}</p>
                  {n.appSlug && (
                    <Link
                      href={`/app/${n.appSlug}`}
                      onClick={() => markOne(n.id)}
                      className="inline-block text-primary text-[13px] font-bold mt-1.5 hover:underline"
                    >
                      {d.viewApp}
                    </Link>
                  )}
                </div>
                {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" aria-label="unread" />}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Package } from "lucide-react";
import { toFaDigits } from "@/lib/fa";
import { Button } from "@/components/ui/button";

type Notif = {
  id: string; title: string; message: string | null; isRead: boolean;
  createdAt: string; appSlug: string | null; versionName: string | null;
};

export default function NotificationsPage() {
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

  if (loading) return <p className="text-muted-foreground text-sm">در حال بارگذاری...</p>;

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" aria-hidden="true" /> اعلان‌ها
        </h1>
        {items.some((x) => !x.isRead) && (
          <Button type="button" variant="ghost" size="sm" onClick={markAll}>
            همه را خوانده‌شده کن
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-3xl">
          <BellOff className="w-10 h-10 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">اعلانی ندارید. برنامه‌های محبوبتان را به علاقه‌مندی‌ها اضافه کنید تا از نسخه‌های جدید باخبر شوید.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}
              className={`bg-card border rounded-2xl p-4 flex gap-3 ${n.isRead ? "border-border opacity-70" : "border-primary/40"}`}>
              <span className="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Package className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{n.title}</p>
                {n.message && <p className="text-sm text-muted-foreground mt-1">{n.message}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {n.appSlug && (
                    <Link href={`/app/${n.appSlug}`} onClick={() => markOne(n.id)}
                      className="text-xs text-primary font-bold hover:underline">مشاهده برنامه ←</Link>
                  )}
                  {!n.isRead && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => markOne(n.id)} className="h-7 px-2 text-xs">خوانده شد</Button>
                  )}
                </div>
              </div>
              {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" aria-label="خوانده‌نشده" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

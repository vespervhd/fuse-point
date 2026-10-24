"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { STR, num, type Locale } from "@/lib/i18n";

// زنگ اعلان هدر — به صفحه‌ی اعلان‌ها می‌رود؛ نشان خوانده‌نشده از API واقعی
export default function NotifBell({ locale = "fa" }: { locale?: Locale }) {
  const [unread, setUnread] = useState(0);
  const d = STR[locale];

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch("/api/notifications");
        if (!r.ok) return;
        const j = await r.json();
        if (!stop) setUnread(j.unread || 0);
      } catch {}
    };
    load();
    const t = setInterval(load, 60000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  return (
    <Link href="/notifications" aria-label={d.notifications} className="hdr-icon-btn">
      <Bell className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
      {unread > 0 && (
        <span className="absolute top-0.5 end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
          {unread > 9 ? `${num(9, locale)}+` : num(unread, locale)}
        </span>
      )}
    </Link>
  );
}

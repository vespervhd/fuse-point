"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotifBell() {
  const [unread, setUnread] = useState(0);

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

  if (!unread) {
    return (
      <Link href="/notifications" aria-label="اعلان‌ها"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
        <Bell className="w-5 h-5" aria-hidden="true" />
      </Link>
    );
  }
  return (
    <Link href="/notifications" aria-label={`${unread} اعلان خوانده‌نشده`}
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative rounded-full")}>
      <Bell className="w-5 h-5" aria-hidden="true" />
      <span className="absolute top-1 end-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center">
        {unread > 9 ? "۹+" : unread}
      </span>
    </Link>
  );
}

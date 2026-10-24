import AppCard, { type CardApp } from "@/components/AppCard";
import { toFaDigits } from "@/lib/fa";
import { Inbox } from "lucide-react";

export default function AppGrid({ title, subtitle, apps }: {
  title: string; subtitle?: string; apps: CardApp[];
}) {
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {apps.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((a, i) => <AppCard key={a.id} app={a} index={i} />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl p-10 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
          <p className="font-bold mb-1">موردی برای نمایش وجود ندارد</p>
          <p className="text-sm text-muted-foreground">هنوز داده‌ی کافی ثبت نشده است.</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-6">{toFaDigits(apps.length)} برنامه</p>
    </div>
  );
}

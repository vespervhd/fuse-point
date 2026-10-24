import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";
import LogoutButton from "../LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role === "user") redirect("/admin/login");

  const locale = await getLocale();
  const d = STR[locale];

  const NAV = [
    ["/admin", "📊", d.adm_dashboard],
    ["/admin/apps", "📱", d.adm_navApps],
    ["/admin/categories", "🗂️", d.cats],
    ["/admin/reports", "⚠️", d.adm_navReports],
    ["/admin/errors", "🐞", d.adm_navErrors],
    ["/admin/reviews", "⭐", d.adm_navReviews],
  ] as const;

  return (
    <div className="flex gap-6 min-h-[70vh]">
      <aside className="w-56 shrink-0 hidden md:block">
        <div className="bg-card border border-border rounded-3xl p-4 sticky top-24">
          <div className="px-2 py-3 border-b border-border mb-3">
            <p className="font-bold text-sm truncate">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.role === "admin" ? d.adm_superAdmin : user.role}</p>
          </div>
          <nav className="space-y-1" aria-label={d.adm_navLabel}>
            {NAV.map(([href, icon, label]) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition">
                <span className="text-lg" aria-hidden="true">{icon}</span>{label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-border">
            <LogoutButton locale={locale} />
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

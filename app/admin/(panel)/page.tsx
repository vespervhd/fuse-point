import Link from "next/link";
import { getDashboardStats } from "@/lib/store";
import { timeAgo } from "@/lib/fa";
import { getLocale } from "@/lib/i18n-server";
import { STR, num, dateL } from "@/lib/i18n";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { desc, eq } from "drizzle-orm";


export default async function AdminDashboard() {
  const locale = await getLocale();
  const d = STR[locale];
  const stats = await getDashboardStats();
  const recentReports = await db.select({
    id: s.reports.id, type: s.reports.type, message: s.reports.message,
    createdAt: s.reports.createdAt, appName: s.apps.nameFa,
  }).from(s.reports).innerJoin(s.apps, eq(s.reports.appId, s.apps.id))
    .where(eq(s.reports.status, "open"))
    .orderBy(desc(s.reports.createdAt)).limit(5);
  const pendingVersions = await db.select({
    id: s.appVersions.id, versionName: s.appVersions.versionName,
    createdAt: s.appVersions.createdAt, appName: s.apps.nameFa, appId: s.apps.id,
  }).from(s.appVersions).innerJoin(s.apps, eq(s.appVersions.appId, s.apps.id))
    .where(eq(s.appVersions.status, "pending"))
    .orderBy(desc(s.appVersions.createdAt)).limit(5);

  const cards = [
    ["📱", d.adm_cardPublishedApps, stats.apps, "/admin/apps"],
    ["📦", d.adm_cardActiveVersions, stats.versions, "/admin/apps"],
    ["⬇️", d.adm_cardTotalDownloads, stats.downloads, "/popular"],
    ["⚠️", d.adm_cardOpenReports, stats.openReports, "/admin/reports"],
  ] as const;

  const openErrors = await db.select({ id: s.errorLogs.id }).from(s.errorLogs)
    .where(eq(s.errorLogs.status, "open")).limit(1000);

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold mb-6">{d.adm_dashboard}</h1>

      {openErrors.length > 0 && (
        <Link href="/admin/errors"
          className="block mb-6 bg-destructive/10 border border-destructive/40 rounded-3xl p-5 hover:border-destructive transition">
          <p className="font-extrabold text-destructive">
            🐞 {d.adm_openErrors.replace("{n}", num(openErrors.length, locale))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{d.adm_clickToReview}</p>
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(([icon, label, value, href]) => (
          <Link key={label} href={href}
            className="bg-card border border-border rounded-3xl p-5 hover:border-primary/50 hover:shadow-md transition">
            <p className="text-3xl mb-2" aria-hidden="true">{icon}</p>
            <p className="text-2xl font-extrabold">{num(value, locale)}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-3xl p-6" aria-label={d.adm_pendingVersions}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-extrabold">{d.adm_pendingVersions}</h2>
            <Link href="/admin/apps" className="text-sm text-primary hover:underline">{d.adm_manageVersions}</Link>
          </div>
          {pendingVersions.length ? (
            <ul className="space-y-2 text-sm">
              {pendingVersions.map((v) => (
                <li key={v.id} className="flex justify-between bg-muted rounded-xl px-4 py-2.5">
                  <span className="font-bold">{v.appName} <span dir="ltr">v{v.versionName}</span></span>
                  <span className="text-muted-foreground text-xs">{locale === "fa" ? timeAgo(v.createdAt) : dateL(v.createdAt, locale)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">{d.adm_nothingPending}</p>}
        </section>

        <section className="bg-card border border-border rounded-3xl p-6" aria-label={d.adm_latestReports}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-extrabold">{d.adm_latestOpenReports}</h2>
            <Link href="/admin/reports" className="text-sm text-primary hover:underline">{d.adm_allReports}</Link>
          </div>
          {recentReports.length ? (
            <ul className="space-y-2 text-sm">
              {recentReports.map((r) => (
                <li key={r.id} className="bg-muted rounded-xl px-4 py-2.5">
                  <p className="font-bold">{r.appName}</p>
                  <p className="text-muted-foreground text-xs line-clamp-2 mt-1">{r.message}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">{d.adm_noOpenReports}</p>}
        </section>
      </div>
    </div>
  );
}

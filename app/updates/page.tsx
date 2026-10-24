import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { toFaDigits } from "@/lib/fa";
import { px } from "@/lib/img";
import { Inbox, RefreshCw, CheckCircle2 } from "lucide-react";
import PxImg from "@/components/PxImg";

export const metadata = { title: "به‌روزرسانی‌ها" };

export default async function UpdatesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/updates");

  // آخرین نسخه‌ای که کاربر برای هر برنامه دانلود کرده
  const downloads = await db.select({
    appId: s.downloadEvents.appId,
    versionId: s.downloadEvents.versionId,
    createdAt: s.downloadEvents.createdAt,
  }).from(s.downloadEvents)
    .where(eq(s.downloadEvents.userId, user.id))
    .orderBy(desc(s.downloadEvents.createdAt));

  // برای هر برنامه، آخرین دانلود
  const latestDl = new Map<string, string | null>();
  for (const d of downloads) {
    if (!latestDl.has(d.appId)) latestDl.set(d.appId, d.versionId);
  }

  if (!latestDl.size) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Inbox className="w-14 h-14 mx-auto mb-4 text-muted" aria-hidden="true" />
        <h1 className="text-xl font-extrabold mb-2">هنوز چیزی دانلود نکردی</h1>
        <p className="text-muted mb-6">برنامه‌هایی که دانلود می‌کنی اینجا دنبال می‌شن و وقتی نسخه‌ی جدید بیاد خبرت می‌کنم</p>
        <Link href="/" className="inline-block bg-primary text-primary-fg font-bold px-6 py-3 rounded-2xl">
          مرور برنامه‌ها
        </Link>
      </div>
    );
  }

  const appIds = [...latestDl.keys()];
  const apps = await db.select({
    id: s.apps.id, slug: s.apps.slug, nameFa: s.apps.nameFa, nameEn: s.apps.nameEn,
    iconUrl: s.apps.iconUrl,
  }).from(s.apps).where(inArray(s.apps.id, appIds));

  // جدیدترین نسخه‌ی فعال هر برنامه
  const updates: typeof apps = [];
  const upToDate: typeof apps = [];
  for (const app of apps) {
    const dlVersionId = latestDl.get(app.id);
    const latest = await db.select({ id: s.appVersions.id, versionName: s.appVersions.versionName })
      .from(s.appVersions)
      .where(and(eq(s.appVersions.appId, app.id), eq(s.appVersions.status, "active")))
      .orderBy(desc(s.appVersions.versionCode)).limit(1);
    if (latest.length && latest[0].id !== dlVersionId) {
      (app as typeof app & { newVersion?: string | null }).newVersion = latest[0].versionName;
      updates.push(app);
    } else {
      upToDate.push(app);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <RefreshCw className="w-6 h-6 text-primary" aria-hidden="true" /> به‌روزرسانی‌ها
      </h1>
      <p className="text-sm text-muted mb-6">
        {updates.length > 0
          ? `${toFaDigits(updates.length)} برنامه نسخه‌ی جدید دارن`
          : "همه‌ی برنامه‌هات به‌روزن"}
      </p>

      {updates.length > 0 && (
        <div className="space-y-3 mb-8">
          {updates.map((app) => (
            <Link key={app.id} href={`/app/${app.slug}`}
              className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 hover:border-primary/50 transition">
              {(app.iconUrl ? (
                <PxImg src={px(app.iconUrl) || app.iconUrl} alt={app.nameFa} width={56} height={56}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0 bg-surface-2" />
              ) : (
                <span className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center text-2xl font-bold shrink-0">
                  {app.nameFa.charAt(0)}
                </span>
              ))}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{app.nameFa}</h3>
                <p className="text-xs text-muted" dir="ltr" style={{ textAlign: "right" }}>{app.nameEn}</p>
                <p className="text-xs text-primary font-bold mt-1">
                  نسخه‌ی جدید: {(app as { newVersion?: string }).newVersion || "جدید"} 🆕
                </p>
              </div>
              <span className="shrink-0 bg-primary text-primary-fg text-sm font-bold px-4 py-2 rounded-xl">
                به‌روزرسانی
              </span>
            </Link>
          ))}
        </div>
      )}

      {upToDate.length > 0 && (
        <>
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" /> به‌روز هستن
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upToDate.map((app) => (
              <Link key={app.id} href={`/app/${app.slug}`}
                className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-3 hover:border-primary/50 transition opacity-75">
                <span className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-lg font-bold shrink-0">
                  {app.nameFa.charAt(0)}
                </span>
                <span className="font-bold text-sm truncate">{app.nameFa}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

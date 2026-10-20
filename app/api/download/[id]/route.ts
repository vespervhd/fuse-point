import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { log, errCtx } from "@/lib/log";

// GET /api/download/[id] — ثبت رویداد دانلود و ریدایرکت به فایل واقعی
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const rows = await db.select({
    id: s.appVersions.id, fileUrl: s.appVersions.fileUrl,
    status: s.appVersions.status, appId: s.appVersions.appId,
  }).from(s.appVersions).where(eq(s.appVersions.id, id)).limit(1);
  const ver = rows[0];

  if (!ver || ver.status !== "active" || !ver.fileUrl) {
    return apiError("لینک دانلود در دسترس نیست", 404);
  }

  // جلوگیری از شمارش تکراری: هر IP در هر ۲۴ ساعت یک‌بار شمرده می‌شود.
  // ثبت رویداد و افزایش شمارنده‌ی materialized (apps.download_count) در یک تراکنش‌اند
  // تا عدد نمایش‌داده‌شده همیشه با رویدادها یکی بماند (اسپک بک‌اند §۵).
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip") || "unknown";
    const day = new Date().toISOString().slice(0, 10);
    const ipHash = createHash("sha256").update(`${ip}|${day}|vesper`).digest("hex");
    const since = new Date(Date.now() - 24 * 3600 * 1000);

    await db.transaction(async (tx) => {
      const dup = await tx.select({ id: s.downloadEvents.id }).from(s.downloadEvents)
        .where(and(
          eq(s.downloadEvents.appId, ver.appId),
          eq(s.downloadEvents.ipHash, ipHash),
          gte(s.downloadEvents.createdAt, since),
        )).limit(1);

      if (!dup.length) {
        const sessionUser = await getSessionUser().catch(() => null);
        await tx.insert(s.downloadEvents).values({
          appId: ver.appId,
          versionId: ver.id,
          ipHash,
          userAgent: req.headers.get("user-agent")?.slice(0, 500),
          userId: sessionUser?.id ?? null,
        });
        await tx.update(s.apps)
          .set({ downloadCount: sql`${s.apps.downloadCount} + 1` })
          .where(eq(s.apps.id, ver.appId));
      }
    });
  } catch (e) {
    // خطا در ثبت آمار نباید دانلود را متوقف کند
    log.error("download.log_failed", { versionId: ver.id, appId: ver.appId, ...errCtx(e) });
  }

  return NextResponse.redirect(ver.fileUrl, 302);
}

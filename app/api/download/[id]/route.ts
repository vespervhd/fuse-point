import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

// GET /api/download/[id] — ثبت رویداد دانلود و ریدایرکت به فایل واقعی
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const rows = await db.select({
    id: s.appVersions.id, fileUrl: s.appVersions.fileUrl,
    status: s.appVersions.status, appId: s.appVersions.appId,
  }).from(s.appVersions).where(eq(s.appVersions.id, id)).limit(1);
  const ver = rows[0];

  if (!ver || !ver.fileUrl) {
    return NextResponse.json(
      { error: "لینک دانلود در دسترس نیست" },
      { status: 404 }
    );
  }
  // فالبک دانلود (گزینه‌ی ۱ مالک): نسخه‌ی در انتظار بازبینی فقط وقتی قابل دانلود
  // است که اپ هیچ نسخه‌ی فعالی نداشته باشد؛ وگرنه دروازه‌ی بازبینی بسته می‌ماند.
  if (ver.status !== "active") {
    if (ver.status !== "pending") {
      return NextResponse.json(
        { error: "لینک دانلود در دسترس نیست" },
        { status: 404 }
      );
    }
    const act = await db.select({ id: s.appVersions.id }).from(s.appVersions)
      .where(and(eq(s.appVersions.appId, ver.appId), eq(s.appVersions.status, "active")))
      .limit(1);
    if (act.length) {
      return NextResponse.json(
        { error: "لینک دانلود در دسترس نیست" },
        { status: 404 }
      );
    }
  }

  // جلوگیری از شمارش تکراری: هر IP در هر ۲۴ ساعت یک‌بار شمرده می‌شود
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip") || "unknown";
    const day = new Date().toISOString().slice(0, 10);
    const ipHash = createHash("sha256").update(`${ip}|${day}|vesper`).digest("hex");
    const since = new Date(Date.now() - 24 * 3600 * 1000);

    const dup = await db.select({ id: s.downloadEvents.id }).from(s.downloadEvents)
      .where(and(
        eq(s.downloadEvents.appId, ver.appId),
        eq(s.downloadEvents.ipHash, ipHash),
        gte(s.downloadEvents.createdAt, since),
      )).limit(1);

    if (!dup.length) {
      const sessionUser = await getSessionUser().catch(() => null);
      await db.insert(s.downloadEvents).values({
        appId: ver.appId,
        versionId: ver.id,
        ipHash,
        userAgent: req.headers.get("user-agent")?.slice(0, 500),
        userId: sessionUser?.id ?? null,
      });
    }
  } catch (e) {
    // خطا در ثبت آمار نباید دانلود را متوقف کند
    console.error("download log failed:", e);
  }

  return NextResponse.redirect(ver.fileUrl, 302);
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { rateLimited } from "@/lib/rate-limit";

// GET /api/notifications — فهرست اعلان‌های کاربر
export async function GET() {
  const me = await getSessionUser();
  if (!me) return apiError("وارد شوید", 401);
  const items = await db.select({
    id: s.notifications.id, type: s.notifications.type,
    title: s.notifications.title, message: s.notifications.message,
    isRead: s.notifications.isRead, createdAt: s.notifications.createdAt,
    appId: s.notifications.appId, appName: s.apps.nameFa, appSlug: s.apps.slug,
    versionName: s.appVersions.versionName,
  }).from(s.notifications)
    .leftJoin(s.apps, eq(s.apps.id, s.notifications.appId))
    .leftJoin(s.appVersions, eq(s.appVersions.id, s.notifications.versionId))
    .where(eq(s.notifications.userId, me.id))
    .orderBy(desc(s.notifications.createdAt)).limit(50);
  const unread = await db.select({ c: sql<number>`count(*)` }).from(s.notifications)
    .where(and(eq(s.notifications.userId, me.id), eq(s.notifications.isRead, false)));
  return NextResponse.json({ items, unread: Number(unread[0]?.c ?? 0) });
}

// PATCH /api/notifications — خوانده‌شده کردن (یک اعلان یا همه)
export async function PATCH(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return apiError("وارد شوید", 401);
  if (rateLimited(`notifications:${me.id}`, 120, 3600_000)) return apiError("تعداد درخواست‌ها بیش از حد مجاز است", 429);
  const body = await req.json().catch(() => ({}));
  if (body.id) {
    await db.update(s.notifications).set({ isRead: true })
      .where(and(eq(s.notifications.id, body.id), eq(s.notifications.userId, me.id)));
  } else {
    await db.update(s.notifications).set({ isRead: true })
      .where(eq(s.notifications.userId, me.id));
  }
  return NextResponse.json({ ok: true });
}

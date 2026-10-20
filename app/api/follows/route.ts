import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { rateLimited } from "@/lib/rate-limit";

// GET /api/follows?appId=xxx — بررسی وضعیت دنبال کردن
// POST /api/follows — دنبال کردن { appId }
// DELETE /api/follows?appId=xxx — لغو دنبال کردن

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ following: false });
  const appId = new URL(req.url).searchParams.get("appId");
  if (!appId) return apiError("appId لازم است", 400);
  const rows = await db.select().from(s.follows)
    .where(and(eq(s.follows.userId, user.id), eq(s.follows.appId, appId))).limit(1);
  return NextResponse.json({ following: rows.length > 0 });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return apiError("وارد شوید", 401);
  if (rateLimited(`follows:${user.id}`, 120, 3600_000)) return apiError("تعداد درخواست‌ها بیش از حد مجاز است", 429);
  const { appId } = await req.json().catch(() => ({}));
  if (!appId) return apiError("appId لازم است", 400);
  await db.insert(s.follows).values({ userId: user.id, appId }).onConflictDoNothing();
  return NextResponse.json({ following: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return apiError("وارد شوید", 401);
  if (rateLimited(`follows:${user.id}`, 120, 3600_000)) return apiError("تعداد درخواست‌ها بیش از حد مجاز است", 429);
  const appId = new URL(req.url).searchParams.get("appId");
  if (!appId) return apiError("appId لازم است", 400);
  await db.delete(s.follows)
    .where(and(eq(s.follows.userId, user.id), eq(s.follows.appId, appId)));
  return NextResponse.json({ following: false });
}

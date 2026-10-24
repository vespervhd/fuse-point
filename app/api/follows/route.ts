import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

// GET /api/follows?appId=xxx — بررسی وضعیت دنبال کردن
// POST /api/follows — دنبال کردن { appId }
// DELETE /api/follows?appId=xxx — لغو دنبال کردن

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ following: false });
  const appId = new URL(req.url).searchParams.get("appId");
  if (!appId) return NextResponse.json({ error: "appId لازم است" }, { status: 400 });
  const rows = await db.select().from(s.follows)
    .where(and(eq(s.follows.userId, user.id), eq(s.follows.appId, appId))).limit(1);
  return NextResponse.json({ following: rows.length > 0 });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "وارد شوید" }, { status: 401 });
  const { appId } = await req.json().catch(() => ({}));
  if (!appId) return NextResponse.json({ error: "appId لازم است" }, { status: 400 });
  const app = await db.select({ id: s.apps.id }).from(s.apps)
    .where(and(eq(s.apps.id, appId), eq(s.apps.isPublished, true))).limit(1);
  if (!app[0]) return NextResponse.json({ error: "برنامه یافت نشد" }, { status: 404 });
  await db.insert(s.follows).values({ userId: user.id, appId }).onConflictDoNothing();
  return NextResponse.json({ following: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "وارد شوید" }, { status: 401 });
  const appId = new URL(req.url).searchParams.get("appId");
  if (!appId) return NextResponse.json({ error: "appId لازم است" }, { status: 400 });
  await db.delete(s.follows)
    .where(and(eq(s.follows.userId, user.id), eq(s.follows.appId, appId)));
  return NextResponse.json({ following: false });
}

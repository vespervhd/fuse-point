import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

// GET /api/requests — درخواست‌های خودم
// POST /api/requests — ثبت درخواست افزودن برنامه { appName, sourceLink?, platform, note? }

export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "وارد نشده‌اید" }, { status: 401 });
  const rows = await db.select({
    id: s.appRequests.id, appName: s.appRequests.appName, sourceLink: s.appRequests.sourceLink,
    platform: s.appRequests.platform, note: s.appRequests.note, status: s.appRequests.status,
    createdAt: s.appRequests.createdAt,
  }).from(s.appRequests)
    .where(eq(s.appRequests.userId, u.id))
    .orderBy(desc(s.appRequests.createdAt))
    .limit(50);
  return NextResponse.json({ requests: rows });
}

const Body = z.object({
  appName: z.string().trim().min(1).max(255),
  sourceLink: z.string().trim().max(1000).optional().nullable(),
  platform: z.enum(["android", "windows", "linux"]).default("android"),
  note: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "برای ثبت درخواست وارد شوید" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  const d = parsed.data;
  const [row] = await db.insert(s.appRequests).values({
    userId: u.id,
    appName: d.appName,
    sourceLink: d.sourceLink || null,
    platform: d.platform,
    note: d.note || null,
  }).returning({ id: s.appRequests.id });
  return NextResponse.json({ ok: true, id: row?.id });
}

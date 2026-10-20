import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { rateLimited } from "@/lib/rate-limit";

async function me() {
  const u = await getSessionUser();
  return u;
}

// GET /api/favorites — فهرست علاقه‌مندی‌های من
export async function GET() {
  const u = await me();
  if (!u) return apiError("وارد نشده‌اید", 401);
  const rows = await db.select({
    appId: s.favorites.appId,
    slug: s.apps.slug, nameFa: s.apps.nameFa, nameEn: s.apps.nameEn,
    iconUrl: s.apps.iconUrl, shortDesc: s.apps.shortDesc, shortDescFa: s.apps.shortDescFa,
  }).from(s.favorites)
    .innerJoin(s.apps, eq(s.favorites.appId, s.apps.id))
    .where(and(eq(s.favorites.userId, u.id), eq(s.apps.isPublished, true)))
    .orderBy(desc(s.favorites.createdAt));
  return NextResponse.json({ favorites: rows });
}

const Body = z.object({ appId: z.string().min(1) });

// POST /api/favorites — افزودن به علاقه‌مندی‌ها
export async function POST(req: NextRequest) {
  const u = await me();
  if (!u) return apiError("برای ذخیره وارد شوید", 401);
  if (rateLimited(`favorites:${u.id}`, 120, 3600_000)) return apiError("تعداد درخواست‌ها بیش از حد مجاز است", 429);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("ورودی نامعتبر است", 400);

  const app = await db.select({ id: s.apps.id }).from(s.apps)
    .where(and(eq(s.apps.id, parsed.data.appId), eq(s.apps.isPublished, true))).limit(1);
  if (!app[0]) return apiError("برنامه یافت نشد", 404);

  await db.insert(s.favorites).values({ userId: u.id, appId: parsed.data.appId }).onConflictDoNothing();
  return NextResponse.json({ ok: true, favorited: true });
}

// DELETE /api/favorites — حذف از علاقه‌مندی‌ها
export async function DELETE(req: NextRequest) {
  const u = await me();
  if (!u) return apiError("وارد نشده‌اید", 401);
  if (rateLimited(`favorites:${u.id}`, 120, 3600_000)) return apiError("تعداد درخواست‌ها بیش از حد مجاز است", 429);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("ورودی نامعتبر است", 400);

  await db.delete(s.favorites).where(and(
    eq(s.favorites.userId, u.id), eq(s.favorites.appId, parsed.data.appId),
  ));
  return NextResponse.json({ ok: true, favorited: false });
}

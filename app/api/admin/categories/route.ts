import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/fa";
import { apiError } from "@/lib/api-error";
import { invalidateCatalog } from "@/lib/cache-tags";

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const rows = await db.select().from(s.categories).orderBy(s.categories.sortOrder);
  return NextResponse.json({ categories: rows });
}

const CatBody = z.object({
  nameFa: z.string().min(1).max(255),
  nameEn: z.string().max(255).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  icon: z.string().max(64).optional().nullable(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("categories.write");
  if ("response" in auth) return auth.response;
  const parsed = CatBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("ورودی نامعتبر است", 400);
  const d = parsed.data;

  if (d.parentId) {
    const p = await db.select({ id: s.categories.id }).from(s.categories).where(eq(s.categories.id, d.parentId)).limit(1);
    if (!p.length) return apiError("دسته‌ی والد یافت نشد", 400);
  }

  const slug = slugify(d.nameFa) || `cat-${Date.now()}`;
  const dup = await db.select({ id: s.categories.id }).from(s.categories).where(eq(s.categories.slug, slug)).limit(1);
  if (dup.length) return apiError("دسته‌ای با این نام وجود دارد", 409);

  const [cat] = await db.insert(s.categories).values({
    slug, nameFa: d.nameFa, nameEn: d.nameEn || null,
    description: d.description || null, icon: d.icon || null,
    parentId: d.parentId || null, sortOrder: d.sortOrder ?? 0,
    isActive: d.isActive ?? true,
  }).returning();
  invalidateCatalog();
  return NextResponse.json({ ok: true, id: cat.id });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin("categories.write");
  if ("response" in auth) return auth.response;
  const body = await req.json().catch(() => null);
  const parsed = CatBody.extend({ id: z.string() }).safeParse(body);
  if (!parsed.success) return apiError("ورودی نامعتبر است", 400);
  const { id, ...d } = parsed.data;

  if (d.parentId === id) return apiError("دسته نمی‌تواند والد خودش باشد", 400);

  const set: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) if (v !== undefined) set[k] = v === "" ? null : v;
  await db.update(s.categories).set(set).where(eq(s.categories.id, id));
  invalidateCatalog();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin("categories.write");
  if ("response" in auth) return auth.response;
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return apiError("شناسه لازم است", 400);

  // حذف ایمن: اگر اپ یا زیردسته دارد، فقط غیرفعال شود
  const [kids, linked] = await Promise.all([
    db.select({ id: s.categories.id }).from(s.categories).where(eq(s.categories.parentId, id)).limit(1),
    db.select({ appId: s.appCategories.appId }).from(s.appCategories).where(eq(s.appCategories.categoryId, id)).limit(1),
  ]);
  if (kids.length || linked.length) {
    await db.update(s.categories).set({ isActive: false }).where(eq(s.categories.id, id));
    invalidateCatalog();
    return NextResponse.json({ ok: true, soft: true, message: "به‌دلیل داشتن زیرمجموعه، فقط غیرفعال شد" });
  }
  await db.delete(s.categories).where(eq(s.categories.id, id));
  invalidateCatalog();
  return NextResponse.json({ ok: true });
}

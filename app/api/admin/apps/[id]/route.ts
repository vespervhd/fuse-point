import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { apiError } from "@/lib/api-error";
import { invalidateCatalog } from "@/lib/cache-tags";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;

  const rows = await db.select().from(s.apps).where(eq(s.apps.id, id)).limit(1);
  const app = rows[0];
  if (!app) return apiError("یافت نشد", 404);

  const versions = await db.select().from(s.appVersions)
    .where(eq(s.appVersions.appId, id)).orderBy(desc(s.appVersions.versionCode));
  const cats = await db.select({ categoryId: s.appCategories.categoryId }).from(s.appCategories)
    .where(eq(s.appCategories.appId, id));
  return NextResponse.json({ app, versions, categoryIds: cats.map((c) => c.categoryId) });
}

const PatchBody = z.object({
  nameFa: z.string().min(1).max(255).optional(),
  nameEn: z.string().min(1).max(255).optional(),
  shortDesc: z.string().max(500).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  iconUrl: z.string().max(2000).nullable().optional(),
  license: z.string().max(128).nullable().optional(),
  isOpenSource: z.boolean().optional(),
  featured: z.boolean().optional(),
  editorChoice: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sourceUrl: z.string().url("آدرس معتبر نیست").max(2000).nullable().optional().or(z.literal("")),
  categoryIds: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin("apps.write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;

  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return apiError("ورودی نامعتبر است", 400);
  }
  const { categoryIds, ...fields } = parsed.data;
  const clean: Record<string, unknown> = { updatedAt: new Date() };
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) clean[k] = v === "" ? null : v;
  }
  await db.update(s.apps).set(clean).where(eq(s.apps.id, id));

  if (categoryIds) {
    await db.delete(s.appCategories).where(eq(s.appCategories.appId, id));
    for (const cid of categoryIds) {
      await db.insert(s.appCategories).values({ appId: id, categoryId: cid }).onConflictDoNothing();
    }
  }

  await db.insert(s.auditLogs).values({
    userId: auth.user.id, action: "app.update", entity: "app", entityId: id,
  });
  invalidateCatalog();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin("apps.write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  // حذف نرم — لغو انتشار به‌جای حذف فیزیکی
  await db.update(s.apps).set({ isPublished: false, updatedAt: new Date() }).where(eq(s.apps.id, id));
  await db.insert(s.auditLogs).values({
    userId: auth.user.id, action: "app.unpublish", entity: "app", entityId: id,
  });
  invalidateCatalog();
  return NextResponse.json({ ok: true });
}

// ─── نسخه‌ها ───

const VerBody = z.object({
  versionName: z.string().min(1).max(64),
  versionCode: z.number().int().positive(),
  fileUrl: z.string().url("آدرس فایل معتبر نیست").max(2000),
  fileSize: z.number().int().nonnegative().nullable().optional(),
  sha256: z.string().regex(/^[a-fA-F0-9]{64}$/, "هش SHA-256 باید ۶۴ کاراکتر هگز باشد").nullable().optional(),
  minSdk: z.number().int().positive().nullable().optional(),
  changelog: z.string().max(10000).nullable().optional(),
});

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin("apps.write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;

  const parsed = VerBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || "ورودی نامعتبر است", 400);
  }
  const d = parsed.data;

  const dup = await db.select({ id: s.appVersions.id }).from(s.appVersions)
    .where(and(eq(s.appVersions.appId, id), eq(s.appVersions.versionCode, d.versionCode))).limit(1);
  if (dup.length) return apiError("این versionCode قبلاً ثبت شده است", 409);

  // فقط یک نسخه‌ی جاری
  await db.update(s.appVersions).set({ isCurrent: false }).where(eq(s.appVersions.appId, id));
  const [ver] = await db.insert(s.appVersions).values({
    appId: id, versionName: d.versionName, versionCode: d.versionCode,
    fileUrl: d.fileUrl, fileSize: d.fileSize ?? null, sha256: d.sha256 ?? null,
    minSdk: d.minSdk ?? null, changelog: d.changelog ?? null,
    status: "pending", isCurrent: true, source: "manual",
  }).returning();
  await db.update(s.apps).set({ updatedAt: new Date() }).where(eq(s.apps.id, id));

  await db.insert(s.auditLogs).values({
    userId: auth.user.id, action: "version.create", entity: "version", entityId: ver.id,
    meta: { versionName: d.versionName },
  });
  invalidateCatalog();
  return NextResponse.json({ ok: true, id: ver.id });
}

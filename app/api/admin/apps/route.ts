import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/fa";
import { apiError } from "@/lib/api-error";
import { invalidateCatalog } from "@/lib/cache-tags";

const AppBody = z.object({
  packageName: z.string().min(3).max(255),
  nameFa: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  shortDesc: z.string().max(500).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  iconUrl: z.string().url("آدرس آیکون معتبر نیست").max(2000).optional().nullable().or(z.literal("")),
  license: z.string().max(128).optional().nullable(),
  isOpenSource: z.boolean().optional(),
  featured: z.boolean().optional(),
  editorChoice: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sourceUrl: z.string().url("آدرس معتبر نیست").max(2000).optional().nullable().or(z.literal("")),
  categoryIds: z.array(z.string()).optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const rows = await db.select({
    id: s.apps.id, slug: s.apps.slug, packageName: s.apps.packageName,
    nameFa: s.apps.nameFa, nameEn: s.apps.nameEn,
    isPublished: s.apps.isPublished, featured: s.apps.featured,
    updatedAt: s.apps.updatedAt,
    versionCount: sql<number>`(select count(*) from ${s.appVersions} where ${s.appVersions.appId} = ${s.apps.id})`,
  }).from(s.apps).orderBy(desc(s.apps.updatedAt)).limit(200);
  return NextResponse.json({ apps: rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("apps.write");
  if ("response" in auth) return auth.response;

  const parsed = AppBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || "ورودی نامعتبر است", 400);
  }
  const d = parsed.data;

  const dup = await db.select({ id: s.apps.id }).from(s.apps)
    .where(eq(s.apps.packageName, d.packageName)).limit(1);
  if (dup.length) return apiError("این نام بسته قبلاً ثبت شده است", 409);

  const [app] = await db.insert(s.apps).values({
    slug: slugify(d.packageName), packageName: d.packageName,
    nameFa: d.nameFa, nameEn: d.nameEn,
    shortDesc: d.shortDesc || null, description: d.description || null,
    iconUrl: d.iconUrl || null, license: d.license || null,
    isOpenSource: !!d.isOpenSource, featured: !!d.featured,
    editorChoice: !!d.editorChoice, isPublished: !!d.isPublished,
    sourceUrl: d.sourceUrl || null, sourceType: "internal",
  }).returning();

  if (d.categoryIds?.length) {
    for (const cid of d.categoryIds) {
      await db.insert(s.appCategories).values({ appId: app.id, categoryId: cid }).onConflictDoNothing();
    }
  }

  await db.insert(s.auditLogs).values({
    userId: auth.user.id, action: "app.create", entity: "app", entityId: app.id,
    meta: { packageName: d.packageName },
  });

  invalidateCatalog();
  return NextResponse.json({ ok: true, id: app.id });
}

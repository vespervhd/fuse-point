import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { notifyVersionPublished } from "@/lib/notify";
import { apiError } from "@/lib/api-error";
import { invalidateCatalog } from "@/lib/cache-tags";

type Ctx = { params: Promise<{ id: string }> };

const PatchBody = z.object({
  status: z.enum(["pending", "active", "disabled", "rejected"]).optional(),
  isCurrent: z.boolean().optional(),
  changelog: z.string().max(10000).nullable().optional(),
});

// تغییر وضعیت نسخه (تأیید/رد/غیرفعال) — فقط بازبین فایل یا مدیر
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin("versions.verify");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;

  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("ورودی نامعتبر است", 400);

  const rows = await db.select().from(s.appVersions).where(eq(s.appVersions.id, id)).limit(1);
  const ver = rows[0];
  if (!ver) return apiError("یافت نشد", 404);

  const set: Record<string, unknown> = {};
  if (parsed.data.status) {
    set.status = parsed.data.status;
    if (parsed.data.status === "active") {
      set.verifiedAt = new Date();
      set.publishedAt = ver.publishedAt ?? new Date();
    }
  }
  if (parsed.data.isCurrent) {
    await db.update(s.appVersions).set({ isCurrent: false }).where(eq(s.appVersions.appId, ver.appId));
    set.isCurrent = true;
  }
  if (parsed.data.changelog !== undefined) set.changelog = parsed.data.changelog;

  await db.update(s.appVersions).set(set).where(eq(s.appVersions.id, id));
  await db.insert(s.auditLogs).values({
    userId: auth.user.id, action: `version.${parsed.data.status || "update"}`,
    entity: "version", entityId: id,
  });
  // اعلان به علاقه‌مندان برنامه هنگام انتشار نسخه
  if (parsed.data.status === "active") {
    notifyVersionPublished(ver.appId, id).catch(() => {});
  }
  invalidateCatalog();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin("versions.verify");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  await db.update(s.appVersions).set({ status: "disabled", isCurrent: false }).where(eq(s.appVersions.id, id));
  await db.insert(s.auditLogs).values({
    userId: auth.user.id, action: "version.disable", entity: "version", entityId: id,
  });
  invalidateCatalog();
  return NextResponse.json({ ok: true });
}

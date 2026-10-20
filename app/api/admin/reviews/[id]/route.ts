import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { apiError } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin("reports.review");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const parsed = z.object({ status: z.enum(["approved", "rejected"]) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("ورودی نامعتبر است", 400);
  await db.update(s.reviews).set({ status: parsed.data.status }).where(eq(s.reviews.id, id));
  await db.insert(s.auditLogs).values({
    userId: auth.user.id, action: `review.${parsed.data.status}`, entity: "review", entityId: id,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin("reports.review");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  await db.delete(s.reviews).where(eq(s.reviews.id, id));
  return NextResponse.json({ ok: true });
}

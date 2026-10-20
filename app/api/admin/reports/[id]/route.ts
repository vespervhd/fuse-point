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
  const parsed = z.object({ status: z.enum(["open", "in_review", "resolved", "dismissed"]) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("ورودی نامعتبر است", 400);
  await db.update(s.reports).set({ status: parsed.data.status }).where(eq(s.reports.id, id));
  return NextResponse.json({ ok: true });
}

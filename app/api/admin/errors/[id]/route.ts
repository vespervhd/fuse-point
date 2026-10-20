import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { apiError } from "@/lib/api-error";

// PATCH /api/admin/errors/[id] — تغییر وضعیت (open/resolved)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("bad body", 400);
  }
  const status = (body as { status?: string })?.status;
  if (status !== "open" && status !== "resolved") {
    return apiError("invalid status", 400);
  }
  await db
    .update(s.errorLogs)
    .set({ status })
    .where(eq(s.errorLogs.id, id));
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/errors/[id] — حذف رکورد خطا
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  await db.delete(s.errorLogs).where(eq(s.errorLogs.id, id));
  return NextResponse.json({ ok: true });
}

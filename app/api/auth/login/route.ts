import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

const Body = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

const attempts = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const arr = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60_000);
  if (arr.length >= 8) return true;
  arr.push(now);
  attempts.set(ip, arr);
  return false;
}

// POST /api/auth/login — ورود کاربر (عادی یا مدیر)
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("ورودی نامعتبر است", 400);

  const rows = await db.select({
    id: s.users.id, name: s.users.name, email: s.users.email,
    passwordHash: s.users.passwordHash, isActive: s.users.isActive, role: s.roles.name,
  }).from(s.users).innerJoin(s.roles, eq(s.users.roleId, s.roles.id))
    .where(eq(s.users.email, parsed.data.email.toLowerCase().trim())).limit(1);
  const u = rows[0];

  if (!u || !u.isActive || !verifyPassword(parsed.data.password, u.passwordHash)) {
    if (tooMany(ip)) return apiError("تلاش‌های ناموفق زیاد است؛ کمی صبر کنید", 429);
    return apiError("ایمیل یا رمز عبور نادرست است", 401);
  }

  await createSession(u.id);
  return NextResponse.json({ ok: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
}

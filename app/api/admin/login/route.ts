import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, getSessionUser } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

const Body = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

// rate limit ساده: ۵ تلاش در ۱۵ دقیقه برای هر IP
const attempts = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const arr = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60_000);
  if (arr.length >= 5) return true;
  arr.push(now);
  attempts.set(ip, arr);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return apiError("ورودی نامعتبر است", 400);
  }

  const rows = await db.select({
    id: s.users.id, passwordHash: s.users.passwordHash,
    isActive: s.users.isActive, role: s.roles.name,
  }).from(s.users).innerJoin(s.roles, eq(s.users.roleId, s.roles.id))
    .where(eq(s.users.email, parsed.data.email.toLowerCase().trim())).limit(1);
  const u = rows[0];

  const ok = u && u.isActive && u.role !== "user" && verifyPassword(parsed.data.password, u.passwordHash);
  if (!ok) {
    if (tooMany(ip)) return apiError("تلاش‌های ناموفق زیاد است؛ ۱۵ دقیقه صبر کنید", 429);
    // پیام کلی برای جلوگیری از نشت اطلاعات
    return apiError("ایمیل یا رمز عبور نادرست است", 401);
  }

  await createSession(u.id);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

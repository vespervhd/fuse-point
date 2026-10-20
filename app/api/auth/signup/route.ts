import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession, getSessionUser } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

const Body = z.object({
  name: z.string().trim().min(2, "نام خیلی کوتاه است").max(100),
  email: z.string().trim().email("ایمیل نامعتبر است").max(255),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد").max(128),
});

const attempts = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const arr = (attempts.get(ip) || []).filter((t) => now - t < 3600_000);
  if (arr.length >= 10) return true;
  arr.push(now);
  attempts.set(ip, arr);
  return false;
}

// POST /api/auth/signup — ثبت‌نام کاربر عادی
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return apiError("تعداد درخواست‌ها بیش از حد مجاز است", 429);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || "ورودی نامعتبر است", 400);
  }
  const { name, email, password } = parsed.data;
  const emailNorm = email.toLowerCase();

  const dup = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.email, emailNorm)).limit(1);
  if (dup.length) return apiError("این ایمیل قبلاً ثبت شده است", 409);

  const roleRows = await db.select({ id: s.roles.id }).from(s.roles).where(eq(s.roles.name, "user")).limit(1);
  if (!roleRows[0]) return apiError("خطای پیکربندی سرور", 500);

  const [user] = await db.insert(s.users).values({
    email: emailNorm, name, passwordHash: hashPassword(password), roleId: roleRows[0].id,
  }).returning();

  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}

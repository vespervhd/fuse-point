import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError } from "@/lib/api-error";
import { rateLimited, clientIp } from "@/lib/rate-limit";

const Body = z.object({
  appSlug: z.string().max(255).optional(),
  type: z.enum(["broken_link", "wrong_info", "malware_suspicion", "other"]),
  message: z.string().trim().min(5, "شرح مشکل خیلی کوتاه است").max(5000),
});

// POST /api/reports — ثبت گزارش کاربر (ریت‌لیمیت مشترک: حداکثر ۱۰ گزارش در ساعت از هر IP)

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(`reports:${ip}`, 10, 3600_000)) {
    return apiError("تعداد درخواست‌ها بیش از حد مجاز است", 429);
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return apiError("بدنه‌ی درخواست نامعتبر است", 400);
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || "ورودی نامعتبر است", 400);
  }

  let appId: string | null = null;
  if (parsed.data.appSlug) {
    const slug = parsed.data.appSlug.replace(/[^a-z0-9.-]/gi, "").toLowerCase();
    const rows = await db.select({ id: s.apps.id }).from(s.apps)
      .where(eq(s.apps.slug, slug)).limit(1);
    appId = rows[0]?.id ?? null;
    if (!appId) {
      const byPkg = await db.select({ id: s.apps.id }).from(s.apps)
        .where(eq(s.apps.packageName, slug)).limit(1);
      appId = byPkg[0]?.id ?? null;
    }
  }
  if (!appId) {
    return apiError("برنامه‌ای با این مشخصات پیدا نشد", 404);
  }

  await db.insert(s.reports).values({
    appId, type: parsed.data.type, message: parsed.data.message,
  });
  return NextResponse.json({ ok: true });
}

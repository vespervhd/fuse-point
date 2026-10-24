import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";

const Body = z.object({
  appSlug: z.string().max(255).optional(),
  type: z.enum(["broken_link", "wrong_info", "malware_suspicion", "bad_translation", "other"]),
  message: z.string().trim().min(5, "شرح مشکل خیلی کوتاه است").max(5000),
});

// POST /api/reports — ثبت گزارش کاربر (با rate limit ساده)
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 10; // حداکثر ۱۰ گزارش در ساعت
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "تعداد درخواست‌ها بیش از حد مجاز است" }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "بدنه‌ی درخواست نامعتبر است" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "ورودی نامعتبر است" }, { status: 400 });
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
    return NextResponse.json({ error: "برنامه‌ای با این مشخصات پیدا نشد" }, { status: 404 });
  }

  await db.insert(s.reports).values({
    appId, type: parsed.data.type, message: parsed.data.message,
  });
  return NextResponse.json({ ok: true });
}

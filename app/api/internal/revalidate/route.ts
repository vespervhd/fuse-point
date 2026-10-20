import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { invalidateCatalog } from "@/lib/cache-tags";
import { apiError } from "@/lib/api-error";
import { log } from "@/lib/log";

// POST /api/internal/revalidate — بی‌اعتبارکردن کش کاتالوگ برای جهش‌های بیرون از
// پروسه‌ی نکست (سینک F-Droid و ایمپورت روزانه مستقیم روی DB می‌نویسند و به
// revalidateTag دسترسی ندارند). هدر: x-revalidate-token = env REVALIDATE_TOKEN.
// بدنه‌ی اختیاری: { "tags": ["catalog", …] } — بدون بدنه، کل کاتالوگ تازه می‌شود.
// اگر REVALIDATE_TOKEN ست نشده باشد endpoint عملاً غیرفعال است (401).

function tokenOk(given: string | null): boolean {
  const expected = process.env.REVALIDATE_TOKEN;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!tokenOk(req.headers.get("x-revalidate-token"))) {
    return apiError("unauthorized", 401);
  }
  const body = await req.json().catch(() => null);
  const tags: string[] = Array.isArray(body?.tags)
    ? body.tags.filter((t: unknown): t is string => typeof t === "string" && t.length <= 128)
    : [];
  if (tags.length) {
    for (const t of tags) revalidateTag(t, "max");
  } else {
    invalidateCatalog();
  }
  log.info("cache.revalidated", { tags: tags.length ? tags : ["catalog", "categories", "collections", "home"], via: "internal-endpoint" });
  return NextResponse.json({ ok: true, tags });
}

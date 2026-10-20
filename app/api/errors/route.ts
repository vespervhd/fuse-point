import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/error-log";
import { apiError } from "@/lib/api-error";
import { rateLimited, clientIp } from "@/lib/rate-limit";

const Body = z.object({
  message: z.string().trim().min(1).max(2000),
  stack: z.string().max(8000).optional().nullable(),
  url: z.string().max(1000).optional().nullable(),
});

// POST /api/errors — دریافت خطاهای کلاینت (ریت‌لیمیت مشترک: حداکثر ۲۰ خطا در دقیقه از هر IP)

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(`errors:${ip}`, 20, 60_000)) {
    return apiError("too many requests", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("bad body", 400);
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return apiError("invalid input", 400);
  }

  // نادیده گرفتن نویزهای بی‌ارزش مرورگر
  const msg = parsed.data.message;
  if (
    /ResizeObserver|Script error\.?|cancelled|canceled|net::ERR_ABORTED/i.test(msg)
  ) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await logError({
    kind: "client",
    message: msg,
    stack: parsed.data.stack ?? null,
    url: parsed.data.url ?? req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}

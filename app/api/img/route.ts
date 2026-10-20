import { NextRequest, NextResponse } from "next/server";
import { decodeProxyParam } from "@/lib/img";
import { apiError } from "@/lib/api-error";

// GET /api/img?u=<base64url> — پروکسی تصاویر f-droid.org با کش حافظه
// چون f-droid.org ممکن است برای برخی کاربران قابل دسترس نباشد، تصاویر از خودِ سرور سرو می‌شوند.

type Entry = { buf: Buffer; type: string; size: number; at: number };
const cache = new Map<string, Entry>();
const MAX_BYTES = 30 * 1024 * 1024; // ۳۰ مگابایت
let totalBytes = 0;

function touch(key: string, e: Entry) {
  cache.delete(key);
  cache.set(key, { ...e, at: Date.now() });
}

function put(key: string, buf: Buffer, type: string) {
  const size = buf.length;
  if (size > MAX_BYTES / 2) return; // فایل خیلی بزرگ کش نمی‌شود
  while (totalBytes + size > MAX_BYTES && cache.size) {
    const oldest = cache.keys().next().value!;
    totalBytes -= cache.get(oldest)!.size;
    cache.delete(oldest);
  }
  cache.set(key, { buf, type, size, at: Date.now() });
  totalBytes += size;
}

const ALLOWED_TYPES = new Set([
  "image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml",
]);

export async function GET(req: NextRequest) {
  const b64 = new URL(req.url).searchParams.get("u");
  const target = b64 ? decodeProxyParam(b64) : null;
  if (!target) return apiError("آدرس نامعتبر است", 400);

  const hit = cache.get(target);
  if (hit) {
    touch(target, hit);
    return new NextResponse(new Uint8Array(hit.buf), {
      headers: {
        "Content-Type": hit.type,
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const r = await fetch(target, {
      headers: { "User-Agent": "Vesper/1.0 (image proxy)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return apiError("دریافت تصویر ناموفق بود", 502);
    const type = (r.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.has(type)) return apiError("نوع فایل مجاز نیست", 415);
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length) return apiError("تصویر خالی است", 502);
    put(target, buf, type);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch {
    return apiError("خطا در دریافت تصویر", 502);
  }
}

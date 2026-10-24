import { NextRequest, NextResponse } from "next/server";
import { decodeProxyParam } from "@/lib/img";
import sharp from "sharp";

// GET /api/img?u=<base64url>[&s=<width>] — پروکسی تصاویر با کش حافظه
// چون f-droid.org ممکن است برای برخی کاربران قابل دسترس نباشد، تصاویر از خودِ سرور سرو می‌شوند.
// پارامتر s فقط برای آیکن‌هاست: تصویرِ رستری به عرضِ خواسته‌شده کوچک و (اگر مرورگر
// بپذیرد) به WebP تبدیل می‌شود. SVG و GIF هرگز دست نمی‌خورند (مقیاس‌پذیر / متحرک‌اند)
// و اسکرین‌شات‌ها (بدون s) با اندازه‌ی کامل می‌مانند. کلیدِ کش نسخه‌دار است تا نسخه‌ی
// کوچک‌شده با نسخه‌ی کامل قاطی نشود.

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

const RASTER_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const b64 = sp.get("u");
  const target = b64 ? decodeProxyParam(b64) : null;
  if (!target) return NextResponse.json({ error: "آدرس نامعتبر است" }, { status: 400 });
  const sizeParam = sp.get("s");
  const width = sizeParam ? parseInt(sizeParam, 10) : NaN;
  const wantResize = Number.isFinite(width) && width >= 16 && width <= 512;
  const acceptWebp = (req.headers.get("accept") || "").includes("image/webp");
  // کلیدِ کش: آدرس + اندازه + فرمتِ خروجی — تا واریانت‌ها با هم قاطی نشوند
  const key = wantResize ? `${target}|w${width}|${acceptWebp ? "webp" : "orig"}` : target;

  const hit = cache.get(key);
  if (hit) {
    touch(key, hit);
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
      headers: { "User-Agent": "FusePoint/1.0 (image proxy)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return NextResponse.json({ error: "دریافت تصویر ناموفق بود" }, { status: 502 });
    const type = (r.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.has(type)) return NextResponse.json({ error: "نوع فایل مجاز نیست" }, { status: 415 });
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length) return NextResponse.json({ error: "تصویر خالی است" }, { status: 502 });

    // کوچک‌سازی + تبدیل فقط برای رسترها وقتی s خواسته شده؛ در غیر این صورت بایتِ اصلی
    let outBuf = buf;
    let outType = type;
    if (wantResize && RASTER_TYPES.has(type)) {
      try {
        const pipeline = sharp(buf).resize(width, width, { fit: "inside", withoutEnlargement: true });
        if (acceptWebp) {
          outBuf = await pipeline.webp({ quality: 80 }).toBuffer();
          outType = "image/webp";
        } else if (type === "image/jpeg") {
          outBuf = await pipeline.jpeg({ quality: 82 }).toBuffer();
        } else {
          outBuf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
          outType = "image/png";
        }
      } catch {
        // اگر پردازش ناموفق بود، بایتِ اصلی برگردد — نه خطا
        outBuf = buf;
        outType = type;
      }
    }
    put(key, outBuf, outType);
    return new NextResponse(new Uint8Array(outBuf), {
      headers: {
        "Content-Type": outType,
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch {
    return NextResponse.json({ error: "خطا در دریافت تصویر" }, { status: 502 });
  }
}

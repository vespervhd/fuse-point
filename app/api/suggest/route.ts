import { NextRequest, NextResponse } from "next/server";
import { searchApps, type Platform } from "@/lib/store";
import { rateLimited, clientIp } from "@/lib/rate-limit";

// پیشنهاد خودکار جست‌وجو: حداکثر ۸ برنامه‌ی منطبق با نام واردشده
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const p = sp.get("platform");
  const platform: Platform = p === "windows" || p === "linux" ? p : "android";
  if (q.length < 2) return NextResponse.json({ items: [] });
  if (rateLimited(`suggest:${clientIp(req)}`, 120, 60_000)) {
    return NextResponse.json({ items: [] }, { status: 429 });
  }
  try {
    const { items } = await searchApps(q, { platform, sort: "name" }, 8, 0);
    return NextResponse.json(
      {
        items: items.map((a) => ({
          slug: a.slug,
          nameFa: a.nameFa,
          nameEn: a.nameEn,
          iconUrl: a.iconUrl,
          platform: a.platform,
        })),
      },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch {
    return NextResponse.json({ items: [] });
  }
}

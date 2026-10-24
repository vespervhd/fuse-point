import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { ALTERNATIVES } from "@/data/alternatives";

const COOKIE = "narm_admin_session";

function validSession(raw: string | undefined): boolean {
  if (!raw) return false;
  const [userId, exp, sig] = raw.split(".");
  if (!userId || !exp || !sig) return false;
  const secret = process.env.SESSION_SECRET || "dev-secret";
  const expected = createHmac("sha256", secret).update(`${userId}.${exp}`).digest("hex");
  if (expected !== sig) return false;
  return Number(exp) > Math.floor(Date.now() / 1000);
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google.com https://www.gstatic.com https://dl.flathub.org https://github.com https://raw.githubusercontent.com https://icons.duckduckgo.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  res.headers.delete("X-Powered-By");
  return res;
}

// ─── 404 واقعی برای صفحات جزئیات ───
// صفحات جزئیات زیر notFound() پرتاب می‌کنند، اما چون پوسته‌ی PPR استریم می‌شود
// پاسخ 200 می‌ماند (سافت-404) — حتی بازنویسی به یک مسیر notFound هم زیر همان
// پوسته استریم می‌شود و 200 می‌ماند (تست شد). طبق راهنمای Next، وجود اسلاگ پیش
// از رندر در پروکسی چک و برای ناموجودها مستقیم «پاسخ 404» برگردانده می‌شود؛
// بدنه همان UI صفحه‌ی پیدا نشد (app/not-found.tsx) به‌صورت HTML مستقل است.
// شرط‌ها دقیقاً آینه‌ی شرط‌های خود صفحه‌هاست؛ هر خطای دیتابیس = fail-open.
function notFoundHtml(request: NextRequest): string {
  const en = request.cookies.get("fp-lang")?.value === "en";
  const t = en
    ? { dir: "ltr", lang: "en", title: "Page not found", msg: "The address you entered is wrong, or this page has been removed.", home: "Back to home" }
    : { dir: "rtl", lang: "fa", title: "صفحه‌ای پیدا نشد", msg: "نشانی واردشده اشتباه است یا این صفحه حذف شده.", home: "بازگشت به خانه" };
  return `<!DOCTYPE html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${t.title} | Fuse Point</title>
<style>
  body{margin:0;background:#070812;color:#eceaf6;font-family:Vazirmatn,system-ui,Tahoma,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
  main{text-align:center;padding:24px}
  svg{color:#8b8ba7;margin-bottom:16px}
  h1{font-size:24px;font-weight:800;margin:0 0 8px}
  p{color:#9a9ab0;font-size:14px;margin:0 0 24px}
  a{display:inline-block;background:#6d6df2;color:#fff;font-weight:700;padding:12px 24px;border-radius:12px;text-decoration:none}
  a:hover{opacity:.9}
</style>
</head>
<body>
<main>
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M11 8.2c.6-1 2.6-1.2 2.6.3 0 1-1.6 1.1-1.6 2.2"/><circle cx="11.6" cy="14" r=".4" fill="currentColor"/></svg>
  <h1>${t.title}</h1>
  <p>${t.msg}</p>
  <a href="/">${t.home}</a>
</main>
</body>
</html>`;
}
const slugifyAlt = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function detailExists(pathname: string): Promise<boolean | null> {
  const m = pathname.match(/^\/(app|category|collection|developer|alternatives|page)\/([^/]+)$/);
  if (!m) return null;
  const kind = m[1];
  let seg = m[2];
  try { seg = decodeURIComponent(seg); } catch { /* نشانی خراب: همان رشته‌ی خام */ }
  if (kind === "alternatives") {
    return ALTERNATIVES.some((a) => slugifyAlt(a.for) === seg);
  }
  try {
    switch (kind) {
      case "app": {
        const r = await db.select({ id: s.apps.id }).from(s.apps)
          .where(and(eq(s.apps.slug, seg), eq(s.apps.isPublished, true))).limit(1);
        return r.length > 0;
      }
      case "category": {
        const r = await db.select({ isActive: s.categories.isActive }).from(s.categories)
          .where(eq(s.categories.slug, seg)).limit(1);
        return r.length > 0 && r[0].isActive;
      }
      case "collection": {
        const r = await db.select({ id: s.collections.id }).from(s.collections)
          .where(and(eq(s.collections.slug, seg), eq(s.collections.isActive, true))).limit(1);
        return r.length > 0;
      }
      case "developer": {
        const r = await db.select({ id: s.developers.id }).from(s.developers)
          .where(eq(s.developers.name, seg)).limit(1);
        return r.length > 0;
      }
      case "page": {
        const r = await db.select({ slug: s.contentPages.slug }).from(s.contentPages)
          .where(eq(s.contentPages.slug, seg)).limit(1);
        return r.length > 0;
      }
    }
  } catch {
    return true;
  }
  return null;
}

// گیت احراز هویت پنل مدیریت + هدرهای امنیتی + 404 واقعی جزئیات
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let res: NextResponse;
  if ((await detailExists(pathname)) === false) {
    res = new NextResponse(notFoundHtml(request), {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } else if (pathname === "/admin/login") {
    if (validSession(request.cookies.get(COOKIE)?.value)) {
      res = NextResponse.redirect(new URL("/admin", request.url));
    } else {
      res = NextResponse.next();
    }
  } else if (pathname.startsWith("/admin")) {
    if (!validSession(request.cookies.get(COOKIE)?.value)) {
      res = NextResponse.redirect(new URL("/admin/login", request.url));
    } else {
      res = NextResponse.next();
    }
  } else {
    res = NextResponse.next();
  }
  return applySecurityHeaders(res);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest).*)"],
};

// شکل یکدست خطای API: همه‌ی روت‌ها { error: «پیام فارسی» } با status درست برمی‌گردانند.
// apiError برای خطاهای موردانتظار (ورودی/مجوز/یافت‌نشدن) و apiFail برای خطای پیش‌بینی‌نشده
// (لاگ ساخت‌یافته + پیام عمومی ۵۰۰، بدون نشت جزئیات داخلی به کلاینت).
import { NextResponse } from "next/server";
import { log, errCtx } from "./log";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiFail(scope: string, e: unknown) {
  log.error("api.unhandled", { scope, ...errCtx(e) });
  return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
}

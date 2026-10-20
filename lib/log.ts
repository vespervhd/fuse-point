// لاگ ساخت‌یافته‌ی نازک — هر رویداد یک خط JSON روی stdout (Render لاگ stdout را نگه می‌دارد؛
// روی VPS به journald/فایل می‌رود). بدون وابستگی خارجی. جایگزین console.* پراکنده در APIها.
// فیلدها: ts (ISO)، level، msg و هر ctx دلخواه (مقادیر حساس مثل رمز/توکن را هرگز لاگ نکنید).

type Level = "info" | "warn" | "error";
type Ctx = Record<string, unknown>;

function emit(level: Level, msg: string, ctx?: Ctx) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...(ctx ?? {}) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

// خطاها را به شکل امن (فقط name/message/stack) در ctx می‌نشاند
export function errCtx(e: unknown): Ctx {
  if (e instanceof Error) return { err: e.name, errMsg: e.message, stack: e.stack };
  return { err: String(e) };
}

export const log = {
  info: (msg: string, ctx?: Ctx) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: Ctx) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: Ctx) => emit("error", msg, ctx),
};

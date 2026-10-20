import { describe, it, expect } from "vitest";
import { px, isProxiable, decodeProxyParam } from "@/lib/img";

// allowlist فعلی lib/img.ts: ‏f-droid.org، favicons گوگل، dl.flathub.org
// (raw.githubusercontent.com عمداً هنوز اضافه نشده — تصمیم معلق Vhd؛ این تست‌ها
// رفتار فعلی را قفل می‌کنند تا هر تغییر allowlist آگاهانه و با آپدیت تست باشد.)

describe("px", () => {
  it("دامنه‌های مجاز را به پروکسی داخلی می‌برد", () => {
    const url = "https://f-droid.org/repo/icons-640/org.schabi.newpipe.1015.png";
    const out = px(url);
    expect(out).toMatch(/^\/api\/img\?u=/);
    const param = out!.split("?u=")[1];
    expect(decodeProxyParam(param)).toBe(url);
  });
  it("دامنه‌ی غیرمجاز را دست‌نخورده برمی‌گرداند", () => {
    expect(px("https://example.com/icon.png")).toBe("https://example.com/icon.png");
    expect(px("https://raw.githubusercontent.com/a/b/icon.png")).toBe("https://raw.githubusercontent.com/a/b/icon.png");
  });
  it("ورودی خالی را null می‌دهد", () => {
    expect(px(null)).toBeNull();
    expect(px(undefined)).toBeNull();
    expect(px("")).toBeNull();
  });
});

describe("isProxiable", () => {
  it("فقط پیشوندهای مجاز را قبول می‌کند", () => {
    expect(isProxiable("https://dl.flathub.org/media/icon.png")).toBe(true);
    expect(isProxiable("https://www.google.com/s2/favicons?domain=x.com")).toBe(true);
    expect(isProxiable("https://f-droid.org.evil.com/icon.png")).toBe(false);
    expect(isProxiable("http://f-droid.org/icon.png")).toBe(false);
    expect(isProxiable(null)).toBe(false);
  });
});

describe("decodeProxyParam", () => {
  it("پارامتر معتبر را به URL اصلی برمی‌گرداند", () => {
    const url = "https://f-droid.org/repo/icon.png";
    const b64 = Buffer.from(url).toString("base64url");
    expect(decodeProxyParam(b64)).toBe(url);
  });
  it("URL غیرمجاز یا ورودی خراب را رد می‌کند (ضد SSRF)", () => {
    const evil = Buffer.from("https://169.254.169.254/latest/meta-data").toString("base64url");
    expect(decodeProxyParam(evil)).toBeNull();
    expect(decodeProxyParam("!!!not-base64!!!")).toBeNull();
    expect(decodeProxyParam("")).toBeNull();
  });
});

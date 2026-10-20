import { describe, it, expect } from "vitest";
import { toFaDigits, normalizeFa, slugify, formatBytes, androidVersion, timeAgo } from "@/lib/fa";

describe("toFaDigits", () => {
  it("ارقام لاتین را فارسی می‌کند", () => {
    expect(toFaDigits(123)).toBe("۱۲۳");
    expect(toFaDigits("a1b2")).toBe("a۱b۲");
    expect(toFaDigits("بدون رقم")).toBe("بدون رقم");
  });
});

describe("normalizeFa", () => {
  it("ی و ک عربی را به فارسی برمی‌گرداند", () => {
    expect(normalizeFa("يكي")).toBe("یکی");
    expect(normalizeFa("ة")).toBe("ه");
  });
  it("نیم‌فاصله را به فاصله تبدیل و فاصله‌های اضافه را جمع می‌کند", () => {
    expect(normalizeFa("نیم‌فاصله")).toBe("نیم فاصله");
    expect(normalizeFa("  چند   فاصله  ")).toBe("چند فاصله");
  });
  it("اعراب را حذف و لاتین را کوچک می‌کند", () => {
    expect(normalizeFa("سَلَام")).toBe("سلام");
    expect(normalizeFa("NewPipe")).toBe("newpipe");
  });
});

describe("slugify", () => {
  it("نام بسته را به اسلاگ تمیز تبدیل می‌کند", () => {
    expect(slugify("Org.Schabi.NewPipe")).toBe("org-schabi-newpipe");
    expect(slugify("  A--B__C  ")).toBe("a-b-c");
    expect(slugify("---")).toBe("");
  });
});

describe("formatBytes", () => {
  it("حجم‌ها را با ارقام فارسی و واحد درست قالب می‌زند", () => {
    expect(formatBytes(null)).toBe("نامشخص");
    expect(formatBytes(0)).toBe("نامشخص");
    expect(formatBytes(1024)).toBe("۱ کیلوبایت");
    expect(formatBytes(1536)).toBe("۱.۵ کیلوبایت");
    expect(formatBytes(5 * 1024 * 1024)).toBe("۵ مگابایت");
  });
});

describe("androidVersion", () => {
  it("SDK را به نسخه‌ی اندروید نگاشت می‌کند", () => {
    expect(androidVersion(24)).toBe("اندروید ۷+");
    expect(androidVersion(34)).toBe("اندروید ۱۴+");
    expect(androidVersion(20)).toBe("اندروید ۲۰+");
    expect(androidVersion(null)).toBe("نامشخص");
    expect(androidVersion(99)).toBe("نامشخص");
  });
});

describe("timeAgo", () => {
  it("بازه‌های رایج را درست برچسب می‌زند", () => {
    const now = Date.now();
    expect(timeAgo(new Date(now - 5 * 60_000))).toBe("۵ دقیقه پیش");
    expect(timeAgo(new Date(now - 2 * 3600_000))).toBe("۲ ساعت پیش");
    expect(timeAgo(new Date(now - 3 * 86400_000))).toBe("۳ روز پیش");
    expect(timeAgo(null)).toBe("نامشخص");
  });
});

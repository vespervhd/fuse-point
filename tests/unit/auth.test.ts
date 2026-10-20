import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";

// getSessionUser قبل از هر دسترسی به DB، امضا و انقضای کوکی را چک می‌کند؛
// برای مسیر «کوکی معتبر» فقط زنجیره‌ی select دیتابیس mock شده است.
const jar = vi.hoisted(() => ({ value: undefined as string | undefined }));
const dbRows = vi.hoisted(() => ({ value: [] as unknown[] }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "narm_admin_session" && jar.value ? { value: jar.value } : undefined),
    set: () => {},
    delete: () => {},
  }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({ limit: async () => dbRows.value }),
        }),
      }),
    }),
  },
}));

process.env.SESSION_SECRET = "test-secret";

import { hashPassword, verifyPassword, getSessionUser, can } from "@/lib/auth";

function signedCookie(userId: string, exp: number): string {
  const sig = createHmac("sha256", "test-secret").update(`${userId}.${exp}`).digest("hex");
  return `${userId}.${exp}.${sig}`;
}

describe("hashPassword / verifyPassword", () => {
  it("هش scrypt می‌سازد و همان رمز را تأیید می‌کند", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(stored).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(verifyPassword("correct horse battery staple", stored)).toBe(true);
  });
  it("رمز اشتباه و فرمت خراب را رد می‌کند", () => {
    const stored = hashPassword("pw-one");
    expect(verifyPassword("pw-two", stored)).toBe(false);
    expect(verifyPassword("pw-one", "not-a-hash")).toBe(false);
    expect(verifyPassword("pw-one", "scrypt::")).toBe(false);
    expect(verifyPassword("pw-one", "")).toBe(false);
  });
  it("نمک تصادفی است: دو هش از یک رمز فرق دارند", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });
});

describe("getSessionUser", () => {
  beforeEach(() => {
    jar.value = undefined;
    dbRows.value = [];
  });

  it("بدون کوکی null می‌دهد", async () => {
    expect(await getSessionUser()).toBeNull();
  });

  it("امضای جعلی را بدون رجوع به DB رد می‌کند", async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    jar.value = `user-1.${exp}.${"0".repeat(64)}`;
    expect(await getSessionUser()).toBeNull();
  });

  it("کوکی منقضی را رد می‌کند", async () => {
    jar.value = signedCookie("user-1", Math.floor(Date.now() / 1000) - 10);
    expect(await getSessionUser()).toBeNull();
  });

  it("کوکی معتبر را به کاربر فعال وصل می‌کند", async () => {
    dbRows.value = [{
      id: "user-1", email: "a@b.c", name: "تست", isActive: true,
      role: "admin", permissions: ["apps.write"],
    }];
    jar.value = signedCookie("user-1", Math.floor(Date.now() / 1000) + 3600);
    const u = await getSessionUser();
    expect(u?.id).toBe("user-1");
    expect(u?.role).toBe("admin");
    expect(u?.permissions).toEqual(["apps.write"]);
  });

  it("کاربر غیرفعال را رد می‌کند", async () => {
    dbRows.value = [{
      id: "user-1", email: "a@b.c", name: null, isActive: false,
      role: "user", permissions: [],
    }];
    jar.value = signedCookie("user-1", Math.floor(Date.now() / 1000) + 3600);
    expect(await getSessionUser()).toBeNull();
  });
});

describe("can", () => {
  const u = { id: "1", email: "a@b.c", name: null, role: "admin", permissions: ["apps.write"] };
  it("مجوز دقیق و wildcard را می‌شناسد", () => {
    expect(can(u, "apps.write")).toBe(true);
    expect(can(u, "apps.delete")).toBe(false);
    expect(can({ ...u, permissions: ["*"] }, "anything.at.all")).toBe(true);
    expect(can(null, "apps.write")).toBe(false);
  });
});

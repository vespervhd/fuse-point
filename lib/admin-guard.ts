import { NextResponse } from "next/server";
import { getSessionUser, can, type SessionUser } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

/** بررسی نشست مدیر؛ در صورت عدم احراز، پاسخ 401/403 برمی‌گرداند */
export async function requireAdmin(perm?: string): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const user = await getSessionUser();
  if (!user) return { response: apiError("وارد نشده‌اید", 401) };
  if (user.role === "user") return { response: apiError("دسترسی ندارید", 403) };
  if (perm && !can(user, perm)) return { response: apiError("دسترسی ندارید", 403) };
  return { user };
}

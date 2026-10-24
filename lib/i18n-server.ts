// خواندن زبان فعال از کوکی — فقط سمت سرور
import { cookies } from "next/headers";
import { LANG_COOKIE, type Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  try {
    const jar = await cookies();
    return jar.get(LANG_COOKIE)?.value === "en" ? "en" : "fa";
  } catch {
    return "fa";
  }
}

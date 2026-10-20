// تگ‌های کش کاتالوگ (Cache Components نیوکست ۱۶) — قرارداد نام‌گذاری یک‌جاست تا
// خواندن‌های کش‌شده (lib/store.ts) و مسیرهای جهش (روت‌های ادمین + endpoint داخلی
// revalidate) دقیقاً روی همان تگ‌ها توافق داشته باشند.
//
// همه‌ی خواندن‌های کش‌شده‌ی کاتالوگ تگ «catalog» را دارند؛ پس هر جهش کاتالوگی با
// invalidateCatalog() همه را تازه می‌کند. تگ‌های ریزتر (categories/collections/home/
// app:<slug>) برای مشاهده‌پذیری و invalidation انتخابی آینده‌اند.
import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  catalog: "catalog",
  categories: "categories",
  collections: "collections",
  home: "home",
} as const;

export const appTag = (slug: string) => `app:${slug}`;
export const appIdTag = (id: string) => `app-id:${id}`;
export const collectionTag = (slug: string) => `collection:${slug}`;

// پروفایل "max": ورودی‌ها stale علامت می‌خورند و بازدید بعدی در پس‌زمینه تازه‌شان
// می‌کند (همان معنای revalidateTag در Cache Components). برای publish ادمین کافی
// است چون ادمین خودش صفحه‌ی عمومی را در همان درخواست نمی‌خواند.
export function invalidateCatalog() {
  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidateTag(CACHE_TAGS.collections, "max");
  revalidateTag(CACHE_TAGS.home, "max");
}

export function invalidateApp(slug?: string | null, id?: string | null) {
  if (slug) revalidateTag(appTag(slug), "max");
  if (id) revalidateTag(appIdTag(id), "max");
}

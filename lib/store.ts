import { connection } from "next/server";
import { db } from "./db";
import * as s from "@/db/schema";
import { eq, and, desc, sql, inArray, like, or } from "drizzle-orm";
import { normalizeFa } from "./fa";

// تمام کوئری‌های فروشگاه داینامیک‌اند (هر درخواست، داده‌ی تازه)
async function dyn() {
  await connection();
}

// تعداد دانلود واقعی هر اپ (رویدادهای یکتا)
const dlCount = sql<number>`(select count(*) from ${s.downloadEvents} where ${s.downloadEvents.appId} = ${s.apps.id})`.as("download_count");
const curVersion = sql<string | null>`(select ${s.appVersions.versionName} from ${s.appVersions} where ${s.appVersions.appId} = ${s.apps.id} and ${s.appVersions.isCurrent} = true and ${s.appVersions.status} = 'active' limit 1)`.as("version_name");
const curFileSize = sql<number | null>`(select ${s.appVersions.fileSize} from ${s.appVersions} where ${s.appVersions.appId} = ${s.apps.id} and ${s.appVersions.isCurrent} = true and ${s.appVersions.status} = 'active' limit 1)`.as("file_size");

const cardCols = {
  id: s.apps.id, slug: s.apps.slug, nameFa: s.apps.nameFa, nameEn: s.apps.nameEn,
  iconUrl: s.apps.iconUrl, shortDesc: s.apps.shortDesc, shortDescFa: s.apps.shortDescFa,
  versionName: curVersion, fileSize: curFileSize, downloadCount: dlCount, githubStars: s.apps.githubStars,
  platform: s.apps.platform, isOpenSource: s.apps.isOpenSource, createdAt: s.apps.createdAt,
  updatedAt: s.apps.updatedAt,
};

// آمار نوار صفحه‌ی اصلی (فیلتر پلتفرم‌محور)
export async function getHomeStats(platform?: Platform) {
  await dyn();
  const conds = [pub, plat(platform)];
  const [a, d, c] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(s.apps).where(and(...conds)),
    db.select({ c: sql<number>`count(*)` }).from(s.downloadEvents)
      .innerJoin(s.apps, eq(s.apps.id, s.downloadEvents.appId))
      .where(and(...conds)),
    db.select({ c: sql<number>`count(distinct ${s.categories.id})` })
      .from(s.categories)
      .innerJoin(s.appCategories, eq(s.appCategories.categoryId, s.categories.id))
      .innerJoin(s.apps, eq(s.apps.id, s.appCategories.appId))
      .where(and(eq(s.categories.isActive, true), ...conds)),
  ]);
  return {
    apps: Number(a[0]?.c ?? 0),
    downloads: Number(d[0]?.c ?? 0),
    categories: Number(c[0]?.c ?? 0),
  };
}

const pub = eq(s.apps.isPublished, true);

// فیلتر پلتفرم (android | windows | linux)
export type Platform = "android" | "windows" | "linux";
export const PLATFORMS: { slug: Platform; label: string; icon: string }[] = [
  { slug: "android", label: "اندروید", icon: "🤖" },
  { slug: "windows", label: "ویندوز", icon: "🪟" },
  { slug: "linux", label: "لینوکس", icon: "🐧" },
];
const plat = (p?: Platform) => (p ? eq(s.apps.platform, p) : undefined);

// نگاشت هر دسته به ریشه‌اش + گرفتن همه نوادگان یک دسته (شامل خودش)
async function getCategoryTree() {
  const cats = await db.select({
    id: s.categories.id, parentId: s.categories.parentId,
  }).from(s.categories).where(eq(s.categories.isActive, true));
  const byId = new Map(cats.map((c) => [c.id, c.parentId]));
  const children = new Map<string, string[]>();
  for (const c of cats) {
    if (c.parentId) {
      if (!children.has(c.parentId)) children.set(c.parentId, []);
      children.get(c.parentId)!.push(c.id);
    }
  }
  const rootOf = (id: string): string => {
    let cur: string | null = id, seen = 0;
    while (cur && byId.get(cur) && seen++ < 20) cur = byId.get(cur)!;
    return cur ?? id;
  };
  const descendantsOf = (rootId: string): string[] => {
    const ids = [rootId], stack = [rootId];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const ch of children.get(cur) || []) { ids.push(ch); stack.push(ch); }
    }
    return ids;
  };
  return { rootOf, descendantsOf };
}

export async function getCollections(platform?: Platform, limit?: number) {
  await dyn();
  const cols = await db.select().from(s.collections)
    .where(eq(s.collections.isActive, true))
    .orderBy(s.collections.sortOrder);
  const out = [];
  for (const c of cols) {
    // شمارش واقعی برنامه‌ها (بدون سقف) — فیلتر پلتفرم‌محور
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.collectionApps)
      .innerJoin(s.apps, eq(s.apps.id, s.collectionApps.appId))
      .where(and(eq(s.collectionApps.collectionId, c.id), eq(s.apps.isPublished, true), plat(platform)));
    const appCount = Number(n);
    // کالکشن خالی در این پلتفرم نمایش داده نمی‌شود
    if (appCount > 0) out.push({ ...c, apps: [], appCount });
    if (limit && out.length >= limit) break;
  }
  return out;
}

export async function getCollectionBySlug(slug: string, platform?: Platform) {
  await dyn();
  const rows = await db.select().from(s.collections)
    .where(and(eq(s.collections.slug, slug), eq(s.collections.isActive, true))).limit(1);
  const col = rows[0];
  if (!col) return null;
  const apps = await db.select(cardCols).from(s.collectionApps)
    .innerJoin(s.apps, eq(s.apps.id, s.collectionApps.appId))
    .where(and(eq(s.collectionApps.collectionId, col.id), eq(s.apps.isPublished, true), plat(platform)))
    .orderBy(s.collectionApps.sortOrder);
  return { ...col, apps };
}

export async function getRootCategories(platform?: Platform) {
  await dyn();
  const rows = await db.select({
    id: s.categories.id, slug: s.categories.slug, nameFa: s.categories.nameFa, nameEn: s.categories.nameEn, icon: s.categories.icon,
  }).from(s.categories)
    .where(and(eq(s.categories.isActive, true), sql`${s.categories.parentId} is null`))
    .orderBy(s.categories.sortOrder, s.categories.nameFa);

  // شمارش برنامه‌ها شامل زیردسته‌ها — فیلتر پلتفرم
  const { rootOf } = await getCategoryTree();
  const links = await db.select({
    categoryId: s.appCategories.categoryId, appId: s.appCategories.appId,
  }).from(s.appCategories)
    .innerJoin(s.apps, eq(s.apps.id, s.appCategories.appId))
    .where(and(eq(s.apps.isPublished, true), plat(platform)));
  const countByRoot = new Map<string, Set<string>>();
  for (const l of links) {
    const root = rootOf(l.categoryId);
    if (!countByRoot.has(root)) countByRoot.set(root, new Set());
    countByRoot.get(root)!.add(l.appId);
  }
  // فقط دسته‌هایی که در این پلتفرم برنامه دارن
  return rows
    .map((r) => ({ ...r, appCount: countByRoot.get(r.id)?.size ?? 0 }))
    .filter((r) => r.appCount > 0);
}

export async function getFeaturedApps(limit = 8, platform?: Platform) {
  await dyn();
  return db.select(cardCols).from(s.apps)
    .where(and(pub, eq(s.apps.featured, true), plat(platform)))
    .orderBy(desc(s.apps.updatedAt)).limit(limit);
}

export async function getEditorChoice(limit = 8, platform?: Platform) {
  await dyn();
  return db.select(cardCols).from(s.apps)
    .where(and(pub, eq(s.apps.editorChoice, true), plat(platform)))
    .orderBy(desc(s.apps.updatedAt)).limit(limit);
}

export async function getPopularApps(limit = 8, platform?: Platform) {
  await dyn();
  return db.select(cardCols).from(s.apps)
    .where(and(pub, plat(platform)))
    .orderBy(desc(dlCount), desc(s.apps.updatedAt)).limit(limit);
}

export async function getLatestApps(limit = 8, platform?: Platform) {
  await dyn();
  return db.select(cardCols).from(s.apps)
    .where(and(pub, plat(platform)))
    .orderBy(desc(s.apps.updatedAt)).limit(limit);
}

// جدیدترین‌ها بر اساس تاریخ اضافه‌شدن به فروشگاه (برای نمای «تازه‌ها»)
export async function getNewestApps(limit = 8, platform?: Platform) {
  await dyn();
  return db.select(cardCols).from(s.apps)
    .where(and(pub, plat(platform)))
    .orderBy(desc(s.apps.createdAt)).limit(limit);
}

// اپ برگزیده‌ی یک پلتفرم: اول پرچم featured، بعد انتخاب سردبیر، بعد پرطرفدارترین
export async function getFeaturedApp(platform?: Platform) {
  await dyn();
  const feat = await db.select(cardCols).from(s.apps)
    .where(and(pub, eq(s.apps.featured, true), plat(platform)))
    .orderBy(desc(s.apps.updatedAt)).limit(1);
  if (feat[0]) return feat[0];
  const ed = await db.select(cardCols).from(s.apps)
    .where(and(pub, eq(s.apps.editorChoice, true), plat(platform)))
    .orderBy(desc(s.apps.updatedAt)).limit(1);
  if (ed[0]) return ed[0];
  const pop = await getPopularApps(1, platform);
  return pop[0] ?? null;
}

// دسته‌ی اصلی هر اپ (اولین دسته بر اساس ترتیب دسته‌ها) برای خط دسته در ردیف‌ها
export async function attachPrimaryCategory<T extends { id: string }>(
  apps: T[],
): Promise<Map<string, { slug: string; nameFa: string; nameEn: string | null }>> {
  const out = new Map<string, { slug: string; nameFa: string; nameEn: string | null }>();
  if (!apps.length) return out;
  const rows = await db.select({
    appId: s.appCategories.appId, slug: s.categories.slug,
    nameFa: s.categories.nameFa, nameEn: s.categories.nameEn, sortOrder: s.categories.sortOrder,
  }).from(s.appCategories)
    .innerJoin(s.categories, eq(s.appCategories.categoryId, s.categories.id))
    .where(and(inArray(s.appCategories.appId, apps.map((a) => a.id)), eq(s.categories.isActive, true)))
    .orderBy(s.categories.sortOrder, s.categories.nameFa);
  for (const r of rows) {
    if (!out.has(r.appId)) out.set(r.appId, { slug: r.slug, nameFa: r.nameFa, nameEn: r.nameEn });
  }
  return out;
}

// صفحه‌ی توسعه‌دهنده: توسعه‌دهنده با نام دقیق + همه‌ی اپ‌های منتشرشده‌اش
export async function getDeveloperPage(name: string) {
  await dyn();
  const devs = await db.select().from(s.developers)
    .where(eq(s.developers.name, name)).limit(1);
  const dev = devs[0];
  if (!dev) return null;
  const apps = await db.select(cardCols).from(s.apps)
    .where(and(pub, eq(s.apps.developerId, dev.id)))
    .orderBy(desc(s.apps.updatedAt));
  return { developer: dev, apps };
}

export async function getOpenSourceApps(limit = 8, platform?: Platform) {
  await dyn();
  return db.select(cardCols).from(s.apps)
    .where(and(pub, eq(s.apps.isOpenSource, true), plat(platform)))
    .orderBy(desc(dlCount)).limit(limit);
}

export async function getRelatedApps(appId: string, limit = 8, platform?: Platform) {
  await dyn();
  // برنامه‌های هم‌دسته (به‌جز خودش)، اول آن‌هایی که بیشترین دسته‌ی مشترک را دارند
  // فقط هم‌پلتفرم: شاید بپسندی نباید برنامه‌ی پلتفرم دیگر نشان دهد
  const myCats = await db.select({ categoryId: s.appCategories.categoryId })
    .from(s.appCategories).where(eq(s.appCategories.appId, appId));
  const catIds = myCats.map((c) => c.categoryId);
  if (!catIds.length) return [];
  const rows = await db.select({ ...cardCols, categoryId: s.appCategories.categoryId })
    .from(s.appCategories)
    .innerJoin(s.apps, eq(s.apps.id, s.appCategories.appId))
    .where(and(inArray(s.appCategories.categoryId, catIds), eq(s.apps.isPublished, true), plat(platform), sql`${s.apps.id} != ${appId}`))
    .limit(limit * 4);
  // امتیازدهی: تعداد دسته‌ی مشترک بیشتر = اول‌تر
  const score = new Map<string, { app: any; n: number }>();
  for (const r of rows) {
    const e = score.get(r.id);
    if (e) e.n++;
    else score.set(r.id, { app: r, n: 1 });
  }
  return [...score.values()].sort((a, b) => b.n - a.n).slice(0, limit).map((e) => e.app);
}

export async function getAppByNameEn(nameEn: string) {
  await dyn();
  const rows = await db.select(cardCols).from(s.apps)
    .where(and(pub, eq(s.apps.nameEn, nameEn)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAppBySlug(slug: string) {
  await dyn();
  const rows = await db.select({
    id: s.apps.id, slug: s.apps.slug, packageName: s.apps.packageName, platform: s.apps.platform,
    nameFa: s.apps.nameFa, nameEn: s.apps.nameEn,
    iconUrl: s.apps.iconUrl, shortDesc: s.apps.shortDesc, shortDescFa: s.apps.shortDescFa, description: s.apps.description, descriptionFa: s.apps.descriptionFa,
    license: s.apps.license, isOpenSource: s.apps.isOpenSource,
    sourceType: s.apps.sourceType, sourceUrl: s.apps.sourceUrl,
    githubRepo: s.apps.githubRepo, githubStars: s.apps.githubStars,
    minSdk: s.apps.minSdk, createdAt: s.apps.createdAt, updatedAt: s.apps.updatedAt,
    developerId: s.apps.developerId,
    developerName: s.developers.name, developerWebsite: s.developers.website,
  }).from(s.apps)
    .leftJoin(s.developers, eq(s.apps.developerId, s.developers.id))
    .where(and(eq(s.apps.slug, slug), pub)).limit(1);
  const app = rows[0];
  if (!app) return null;

  // سقف ۵۰ نسخه‌ی فعال (واقعیت فعلی دیتابیس: حداکثر ۹) + شمار کل تا کشو اگر کوتاه شد، صادقانه اعلام کند
  const versions = await db.select().from(s.appVersions)
    .where(and(eq(s.appVersions.appId, app.id), eq(s.appVersions.status, "active")))
    .orderBy(desc(s.appVersions.versionCode)).limit(50);
  const vTotal = await db.select({ c: sql<number>`count(*)` }).from(s.appVersions)
    .where(and(eq(s.appVersions.appId, app.id), eq(s.appVersions.status, "active")));
  const versionsTotal = Number(vTotal[0]?.c ?? versions.length);

  const cats = await db.select({
    slug: s.categories.slug, nameFa: s.categories.nameFa, icon: s.categories.icon,
  }).from(s.appCategories)
    .innerJoin(s.categories, eq(s.appCategories.categoryId, s.categories.id))
    .where(eq(s.appCategories.appId, app.id));

  const shots = await db.select().from(s.appScreenshots)
    .where(eq(s.appScreenshots.appId, app.id)).orderBy(s.appScreenshots.sortOrder);

  const current = versions.find((v) => v.isCurrent) ?? versions[0] ?? null;
  const perms = current
    ? (await db.select().from(s.appPermissions).where(eq(s.appPermissions.versionId, current.id)))
    : [];

  const dl = await db.select({ c: sql<number>`count(*)` }).from(s.downloadEvents)
    .where(eq(s.downloadEvents.appId, app.id));
  const downloadCount = Number(dl[0]?.c ?? 0);

  // شاید بپسندی: هم‌دسته‌ای‌های هم‌پلتفرم با امتیاز تعداد دسته‌ی مشترک
  const related = await getRelatedApps(app.id, 6, app.platform as Platform);

  return { ...app, versions, versionsTotal, categories: cats, screenshots: shots, current, permissions: perms, downloadCount, similar: related };
}

export type SearchFilters = {
  category?: string;
  openSource?: boolean;
  sort?: "popular" | "newest" | "updated" | "name" | "lightest";
  minSdk?: number;
  platform?: Platform;
};

export async function searchApps(query: string, filters: SearchFilters = {}, limit = 40, offset = 0) {
  await dyn();
  const q = normalizeFa(query);
  const conds = [pub, plat(filters.platform)];

  // نرمال‌سازی ی/ک/ه عربی و نیم‌فاصله در سطح SQL تا با normalizeFa سمت کوئری هم‌خوان باشد
  const normFa = (col: any) => sql`replace(replace(replace(replace(${col}, 'ي', 'ی'), 'ك', 'ک'), 'ة', 'ه'), '\u200c', ' ')`;
  const like = `%${q}%`;
  const starts = `${q}%`;

  // شرط تطبیق یک کلمه در نام فارسی/انگلیسی، نام بسته یا توضیح
  const wordCond = (w: string) => {
    const wl = `%${w}%`;
    return sql`(
      ${normFa(s.apps.nameFa)} ilike ${wl}
      or lower(${s.apps.nameEn}) like ${wl}
      or ${s.apps.packageName} ilike ${wl}
      or ${normFa(s.apps.shortDesc)} ilike ${wl}
      or ${normFa(s.apps.shortDescFa)} ilike ${wl}
    )`;
  };

  if (q) {
    // جست‌وجوی چندکلمه‌ای: هر کلمه باید دست‌کم در یکی از فیلدها باشد (ترتیب کلمات مهم نیست)
    const words = q.split(" ").filter((w) => w.length > 0);
    if (words.length > 1) {
      for (const w of words) conds.push(wordCond(w));
    } else {
      conds.push(wordCond(q));
    }
  }
  if (filters.openSource) conds.push(eq(s.apps.isOpenSource, true));
  if (filters.minSdk) conds.push(sql`${s.apps.minSdk} <= ${filters.minSdk}`);

  let categoryAppIds: string[] | null = null;
  if (filters.category) {
    const cat = await db.select({ id: s.categories.id }).from(s.categories)
      .where(eq(s.categories.slug, filters.category)).limit(1);
    if (cat[0]) {
      const rows = await db.select({ appId: s.appCategories.appId }).from(s.appCategories)
        .where(eq(s.appCategories.categoryId, cat[0].id));
      categoryAppIds = rows.map((r) => r.appId);
      conds.push(categoryAppIds.length ? inArray(s.apps.id, categoryAppIds) : sql`false`);
    }
  }

  // امتیاز ارتباط: تطبیق دقیق نام > شروع‌شونده با نام > شامل‌شونده در نام > نام بسته > توضیح
  const rank = q ? sql<number>`(case
    when ${normFa(s.apps.nameFa)} = ${q} or lower(${s.apps.nameEn}) = ${q} then 100
    when ${normFa(s.apps.nameFa)} ilike ${starts} or lower(${s.apps.nameEn}) like ${starts} then 50
    when ${normFa(s.apps.nameFa)} ilike ${like} or lower(${s.apps.nameEn}) like ${like} then 30
    when ${s.apps.packageName} ilike ${like} then 20
    else 10 end)` : sql<number>`0`;

  const orderBys = filters.sort === "newest" ? [desc(s.apps.createdAt)]
    : filters.sort === "name" ? [s.apps.nameFa]
    : filters.sort === "lightest" ? [sql`${curFileSize} asc nulls last`, desc(s.apps.updatedAt)]
    : filters.sort === "popular" ? [desc(sql`COALESCE(${s.apps.githubStars}, 0) + ${dlCount} * 10`)]
    : [desc(rank), desc(s.apps.updatedAt)]; // «مرتبط‌ترین»: اول ارتباط، بعد تازگی

  const [items, total] = await Promise.all([
    db.select(cardCols).from(s.apps).where(and(...conds)).orderBy(...orderBys).limit(limit).offset(offset),
    db.select({ c: sql<number>`count(*)` }).from(s.apps).where(and(...conds)),
  ]);
  return { items, total: Number(total[0]?.c ?? 0) };
}

export async function getCategoryBySlug(slug: string) {
  await dyn();
  const rows = await db.select().from(s.categories).where(eq(s.categories.slug, slug)).limit(1);
  const cat = rows[0];
  if (!cat || !cat.isActive) return null;
  const children = await db.select().from(s.categories)
    .where(and(eq(s.categories.parentId, cat.id), eq(s.categories.isActive, true)))
    .orderBy(s.categories.sortOrder);
  return { ...cat, children };
}

// پیش‌نمایش زیردسته‌ها: هر زیردسته + حداکثر ۱۰ برنامه‌ی برترش (برای صفحه دسته‌ی والد به سبک اپ‌استورها)
export async function getChildPreviews(parentId: string, perChild = 10, platform?: Platform) {
  await dyn();
  const children = await db.select().from(s.categories)
    .where(and(eq(s.categories.parentId, parentId), eq(s.categories.isActive, true)))
    .orderBy(s.categories.sortOrder);
  const out: { category: (typeof children)[number]; apps: object[]; total: number }[] = [];
  for (const ch of children) {
    const items = await db.select(cardCols).from(s.apps)
      .innerJoin(s.appCategories, eq(s.appCategories.appId, s.apps.id))
      .where(and(pub, plat(platform), eq(s.appCategories.categoryId, ch.id)))
      .groupBy(s.apps.id)
      .orderBy(desc(s.apps.updatedAt)).limit(perChild);
    if (!items.length) continue;
    const t = await db.select({ c: sql<number>`count(distinct ${s.apps.id})` }).from(s.apps)
      .innerJoin(s.appCategories, eq(s.appCategories.appId, s.apps.id))
      .where(and(pub, plat(platform), eq(s.appCategories.categoryId, ch.id)));
    out.push({ category: ch, apps: items, total: Number(t[0]?.c ?? 0) });
  }
  return out;
}

export async function getCategoryApps(slug: string, limit = 40, offset = 0, sort: SearchFilters["sort"] = "updated", platform?: Platform) {
  await dyn();
  const cat = await getCategoryBySlug(slug);
  if (!cat) return null;
  const { descendantsOf } = await getCategoryTree();
  const catIds = descendantsOf(cat.id);
  const orderBy = sort === "popular" ? desc(dlCount) : sort === "name" ? s.apps.nameFa : desc(s.apps.updatedAt);
  const cond = and(pub, plat(platform), inArray(s.appCategories.categoryId, catIds));
  // ممکن است یک برنامه در دو زیردسته باشد — با groupBy تکراری‌ها حذف می‌شوند
  const [items, total] = await Promise.all([
    db.select(cardCols).from(s.apps)
      .innerJoin(s.appCategories, eq(s.appCategories.appId, s.apps.id))
      .where(cond)
      .groupBy(s.apps.id)
      .orderBy(orderBy).limit(limit).offset(offset),
    db.select({ c: sql<number>`count(distinct ${s.apps.id})` }).from(s.apps)
      .innerJoin(s.appCategories, eq(s.appCategories.appId, s.apps.id))
      .where(cond),
  ]);
  return { category: cat, items, total: Number(total[0]?.c ?? 0) };
}

export async function getCategoryCounts(platform?: Platform) {
  await dyn();
  // تعداد برنامه‌ها برای هر دسته (فقط خودش) و برای ریشه‌ها (شامل زیردسته‌ها) — فیلتر پلتفرم
  const { descendantsOf, rootOf } = await getCategoryTree();
  const links = await db.select({
    categoryId: s.appCategories.categoryId, appId: s.appCategories.appId,
  }).from(s.appCategories)
    .innerJoin(s.apps, eq(s.apps.id, s.appCategories.appId))
    .where(and(eq(s.apps.isPublished, true), plat(platform)));
  const direct = new Map<string, Set<string>>();
  const byRoot = new Map<string, Set<string>>();
  for (const l of links) {
    if (!direct.has(l.categoryId)) direct.set(l.categoryId, new Set());
    direct.get(l.categoryId)!.add(l.appId);
    const root = rootOf(l.categoryId);
    if (!byRoot.has(root)) byRoot.set(root, new Set());
    byRoot.get(root)!.add(l.appId);
  }
  const all = new Map<string, number>();
  for (const [k, v] of direct) all.set(k, v.size);
  for (const [k, v] of byRoot) all.set(k, v.size);
  return all;
}

export async function getAllCategories() {
  await dyn();
  return db.select().from(s.categories)
    .where(eq(s.categories.isActive, true))
    .orderBy(s.categories.sortOrder, s.categories.nameFa);
}

export async function getDashboardStats() {
  await dyn();
  const [a, v, d, r] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(s.apps).where(pub),
    db.select({ c: sql<number>`count(*)` }).from(s.appVersions).where(eq(s.appVersions.status, "active")),
    db.select({ c: sql<number>`count(*)` }).from(s.downloadEvents),
    db.select({ c: sql<number>`count(*)` }).from(s.reports).where(eq(s.reports.status, "open")),
  ]);
  return {
    apps: Number(a[0]?.c ?? 0),
    versions: Number(v[0]?.c ?? 0),
    downloads: Number(d[0]?.c ?? 0),
    openReports: Number(r[0]?.c ?? 0),
  };
}

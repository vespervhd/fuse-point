// نرم‌استور | NarmStore — Drizzle schema (PostgreSQL)
import {
  pgTable, text, varchar, integer, bigint, boolean, timestamp,
  primaryKey, index, unique, uniqueIndex, jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── نقش‌ها و کاربران ─────────────────────────────────────────────

export const roles = pgTable("roles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 64 }).notNull().unique(),
  nameFa: varchar("name_fa", { length: 128 }).notNull(),
  permissions: text("permissions").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: text("password_hash").notNull(),
  roleId: text("role_id").notNull().references(() => roles.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("users_role_idx").on(t.roleId)]);

// ─── توسعه‌دهندگان ───────────────────────────────────────────────

export const developers = pgTable("developers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  website: text("website"),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("developers_name_idx").on(t.name)]);

// ─── دسته‌بندی‌ها (چندسطحی) ──────────────────────────────────────

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  nameFa: varchar("name_fa", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("categories_parent_idx").on(t.parentId),
  index("categories_active_idx").on(t.isActive, t.sortOrder),
]);

export const tags = pgTable("tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  nameFa: varchar("name_fa", { length: 255 }).notNull(),
});

// ─── نرم‌افزارها ─────────────────────────────────────────────────

export const apps = pgTable("apps", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  packageName: varchar("package_name", { length: 255 }).notNull().unique(),
  nameFa: varchar("name_fa", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  iconUrl: text("icon_url"),
  shortDesc: text("short_desc"),
  description: text("description"),
  shortDescFa: text("short_desc_fa"),
  descriptionFa: text("description_fa"),
  developerId: text("developer_id").references(() => developers.id, { onDelete: "set null" }),
  license: varchar("license", { length: 128 }),
  isOpenSource: boolean("is_open_source").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  editorChoice: boolean("editor_choice").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  platform: varchar("platform", { length: 16 }).notNull().default("android"),
  githubRepo: varchar("github_repo", { length: 255 }),
  githubStars: integer("github_stars").default(0),
  sourceType: varchar("source_type", { length: 32 }).notNull().default("internal"),
  sourceUrl: text("source_url"),
  externalId: varchar("external_id", { length: 255 }),
  minSdk: integer("min_sdk"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("apps_published_idx").on(t.isPublished, t.updatedAt),
  index("apps_featured_idx").on(t.featured),
  index("apps_editor_idx").on(t.editorChoice),
  index("apps_namefa_idx").on(t.nameFa),
  index("apps_nameen_idx").on(t.nameEn),
]);

export const appVersions = pgTable("app_versions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  versionName: varchar("version_name", { length: 64 }).notNull(),
  versionCode: integer("version_code").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: bigint("file_size", { mode: "number" }),
  sha256: varchar("sha256", { length: 128 }),
  signerSha256: varchar("signer_sha256", { length: 128 }),
  minSdk: integer("min_sdk"),
  fileType: varchar("file_type", { length: 16 }).notNull().default("apk"),
  changelog: text("changelog"),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  isCurrent: boolean("is_current").notNull().default(false),
  source: text("source"),
  verifiedAt: timestamp("verified_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("app_versions_app_code_uidx").on(t.appId, t.versionCode),
  index("app_versions_app_status_idx").on(t.appId, t.status),
  index("app_versions_current_idx").on(t.isCurrent),
  // حداکثر یک نسخه‌ی «فعلی» برای هر رکورد برنامه (رکوردها تک‌پلتفرمی‌اند) — مایگریشن 0009
  uniqueIndex("app_versions_one_current_per_app_uidx").on(t.appId).where(sql`${t.isCurrent} = true`),
]);

export const appCategories = pgTable("app_categories", {
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.appId, t.categoryId] })]);

export const appTags = pgTable("app_tags", {
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.appId, t.tagId] })]);

export const appScreenshots = pgTable("app_screenshots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [index("app_screenshots_app_idx").on(t.appId)]);

export const appPermissions = pgTable("app_permissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  versionId: text("version_id").notNull().references(() => appVersions.id, { onDelete: "cascade" }),
  permission: varchar("permission", { length: 255 }).notNull(),
}, (t) => [index("app_permissions_version_idx").on(t.versionId)]);

// ─── رویدادهای دانلود ────────────────────────────────────────────

export const downloadEvents = pgTable("download_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  versionId: text("version_id").references(() => appVersions.id, { onDelete: "set null" }),
  ipHash: varchar("ip_hash", { length: 128 }).notNull(),
  userAgent: text("user_agent"),
  userId: text("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("dl_app_created_idx").on(t.appId, t.createdAt),
  index("dl_iphash_created_idx").on(t.ipHash, t.createdAt),
]);

// ─── تعامل کاربران ───────────────────────────────────────────────

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  text: text("text"),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("reviews_app_user_uidx").on(t.appId, t.userId),
  index("reviews_app_status_idx").on(t.appId, t.status),
]);

export const favorites = pgTable("favorites", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.appId] })]);

export const follows = pgTable("follows", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.appId] })]);

export const reports = pgTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  versionId: text("version_id"),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  type: varchar("type", { length: 64 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("reports_status_created_idx").on(t.status, t.createdAt)]);

// ─── محتوا ───────────────────────────────────────────────────────

export const contentPages = pgTable("content_pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const newsArticles = pgTable("news_articles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  body: text("body").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("news_published_idx").on(t.isPublished, t.publishedAt)]);

// ─── منابع خارجی ────────────────────────────────────────────────

export const repositories = pgTable("repositories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  type: varchar("type", { length: 32 }).notNull().default("fdroid"),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: varchar("last_sync_status", { length: 64 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const repositorySyncLogs = pgTable("repository_sync_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  repositoryId: text("repository_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
  status: varchar("status", { length: 32 }).notNull().default("running"),
  message: text("message"),
  appsAdded: integer("apps_added").notNull().default(0),
  appsUpdated: integer("apps_updated").notNull().default(0),
}, (t) => [index("sync_repo_started_idx").on(t.repositoryId, t.startedAt)]);

// ─── حسابرسی و تنظیمات ──────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 128 }).notNull(),
  entity: varchar("entity", { length: 64 }),
  entityId: text("entity_id"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("audit_created_idx").on(t.createdAt),
  index("audit_entity_idx").on(t.entity, t.entityId),
]);

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── اعلان‌ها ────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appId: text("app_id").references(() => apps.id, { onDelete: "cascade" }),
  versionId: text("version_id").references(() => appVersions.id, { onDelete: "set null" }),
  type: varchar("type", { length: 32 }).notNull().default("version"),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("notif_user_idx").on(t.userId, t.createdAt),
  index("notif_unread_idx").on(t.userId, t.isRead),
]);

// ─── ترجمه فارسی توضیحات ─────────────────────────────────────────
// shortDescFa / descriptionFa: ترجمه فارسی توضیح کوتاه و کامل برنامه
// اگر خالی باشد، نسخه انگلیسی نمایش داده می‌شود

// ─── کالکشن‌ها ────────────────────────────────────────────────────
export const collections = pgTable("collections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameFa: varchar("name_fa", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 16 }),
  color: varchar("color", { length: 32 }).default("primary"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collectionApps = pgTable("collection_apps", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  collectionId: text("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  appId: text("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [
  unique("collection_app_uidx").on(t.collectionId, t.appId),
  index("collection_apps_cidx").on(t.collectionId, t.sortOrder),
]);

// ─── درخواست افزودن برنامه (از فرم «درخواست اپ») ──────────────────

export const appRequests = pgTable("app_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appName: varchar("app_name", { length: 255 }).notNull(),
  sourceLink: text("source_link"),
  platform: varchar("platform", { length: 16 }).notNull().default("android"),
  note: text("note"),
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending | added | rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("app_requests_user_idx").on(t.userId, t.createdAt),
  index("app_requests_status_idx").on(t.status, t.createdAt),
]);

// ─── نوع‌های کمکی ────────────────────────────────────────────────

export type App = typeof apps.$inferSelect;
export type AppVersion = typeof appVersions.$inferSelect;
export type Category = typeof categories.$inferSelect;

// ─── لاگ خطاها (مانیتورینگ داخلی؛ مکمل Sentry) ────────────────────

export const errorLogs = pgTable("error_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  // اثر انگشت برای گروه‌بندی خطاهای تکراری
  fingerprint: varchar("fingerprint", { length: 64 }).notNull(),
  kind: varchar("kind", { length: 32 }).notNull().default("client"), // client | server | api
  message: text("message").notNull(),
  stack: text("stack"),
  url: text("url"),
  userAgent: text("user_agent"),
  count: integer("count").notNull().default(1),
  status: varchar("status", { length: 32 }).notNull().default("open"), // open | resolved
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
}, (t) => [
  index("error_logs_status_idx").on(t.status, t.lastSeenAt),
  uniqueIndex("error_logs_fingerprint_uidx").on(t.fingerprint),
]);

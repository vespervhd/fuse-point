import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/fa";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };

// صفحه‌های محتوایی (قوانین، حریم خصوصی و...) در جدول content_pages نگه داشته
// می‌شوند. نسخه‌ی انگلیسی هر صفحه با پسوند ‎-en‎ در همان جدول است
// (terms-en ،privacy-en)؛ اگر نسخه‌ی انگلیسی نبود، همان نسخه‌ی فارسی
// نشان داده می‌شود تا صفحه هیچ‌وقت خالی نماند.
async function findPage(slug: string, locale: "fa" | "en") {
  if (locale === "en") {
    const en = await db
      .select()
      .from(s.contentPages)
      .where(eq(s.contentPages.slug, `${slug}-en`))
      .limit(1);
    if (en[0]) return en[0];
  }
  const rows = await db
    .select()
    .from(s.contentPages)
    .where(eq(s.contentPages.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

function updatedLabel(updatedAt: Date | string | null, locale: "fa" | "en") {
  if (!updatedAt) return locale === "fa" ? "نامشخص" : "Unknown";
  if (locale === "fa") return formatDate(updatedAt);
  const date = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const page = await findPage(slug, locale);
  if (!page) return { title: locale === "fa" ? "یافت نشد" : "Not found" };
  return { title: page.title, robots: { index: true } };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const d = STR[locale];
  const page = await findPage(slug, locale);
  if (!page) notFound();

  return (
    <article className="animate-fade-up max-w-3xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-10">
      <h1 className="text-2xl font-extrabold mb-2">{page.title}</h1>
      <p className="text-xs text-muted-foreground mb-6">
        {d.contentUpdated} {updatedLabel(page.updatedAt, locale)}
      </p>
      <div className="text-sm leading-8 whitespace-pre-line">{page.body}</div>
    </article>
  );
}

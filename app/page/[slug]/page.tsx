import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/fa";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rows = await db.select().from(s.contentPages).where(eq(s.contentPages.slug, slug)).limit(1);
  if (!rows[0]) return { title: "یافت نشد" };
  return { title: rows[0].title, robots: { index: true } };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const rows = await db.select().from(s.contentPages).where(eq(s.contentPages.slug, slug)).limit(1);
  const page = rows[0];
  if (!page) notFound();

  return (
    <article className="animate-fade-up max-w-3xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-10">
      <h1 className="text-2xl font-extrabold mb-2">{page.title}</h1>
      <p className="text-xs text-muted-foreground mb-6">آخرین به‌روزرسانی: {formatDate(page.updatedAt)}</p>
      <div className="text-sm leading-8 whitespace-pre-line">{page.body}</div>
    </article>
  );
}

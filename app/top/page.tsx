import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import TopInRail from "@/components/TopInRail";
import { getRootCategories, getCategoryApps, type Platform } from "@/lib/store";

export const metadata: Metadata = {
  title: "برترین‌های هر دسته",
  description: "برترین برنامه‌های هر دسته‌بندی: توسعه، مدیا، امنیت و...",
};

type Props = { searchParams: Promise<{ platform?: string }> };

export default async function TopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const platform = (sp.platform === "windows" || sp.platform === "linux" ? sp.platform : undefined) as Platform | undefined;

  const cats = await getRootCategories(platform);
  // فقط دسته‌هایی که اپ دارند
  const withApps = cats.filter((c) => (c.appCount ?? 0) > 0);

  const rails = [];
  for (const c of withApps) {
    const r = await getCategoryApps(c.slug, 8, 0, "popular", platform);
    if (r && r.items.length >= 3) {
      rails.push({ title: `برترین ${c.nameFa}`, slug: c.slug, apps: r.items });
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">برترین‌های هر دسته</h1>
        <p className="text-muted">محبوب‌ترین برنامه‌های هر دسته‌بندی، یک‌جا.</p>
      </div>
      {rails.map((r) => (
        <TopInRail key={r.slug} title={r.title} categorySlug={r.slug} apps={r.apps} platform={platform} />
      ))}
    </div>
  );
}

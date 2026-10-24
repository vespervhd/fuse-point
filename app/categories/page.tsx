import Link from "next/link";
import { getAllCategories, getCategoryCounts } from "@/lib/store";
import type { Platform } from "@/lib/store";
import DbIcon from "@/components/DbIcon";

export const metadata = { title: "دسته‌بندی‌ها" };

type Props = { searchParams: Promise<{ platform?: string }> };

export default async function CategoriesPage({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat = (platform === "windows" || platform === "linux") ? platform as Platform : undefined;
  const [cats, counts] = await Promise.all([getAllCategories(), getCategoryCounts(plat)]);
  // فقط ریشه‌هایی که در این پلتفرم برنامه دارن
  const roots = cats.filter((c) => !c.parentId && (counts.get(c.id) ?? 0) > 0);
  const childrenOf = (id: string) => cats.filter((c) => c.parentId === id);

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold mb-6">دسته‌بندی‌ها</h1>
      <div className="space-y-6">
        {roots.map((r) => {
          const kids = childrenOf(r.id);
          return (
            <section key={r.id} className="bg-card border border-border rounded-3xl p-6" aria-label={r.nameFa}>
              <Link href={`/category/${r.slug}`} className="flex items-center gap-3 mb-4 group">
                <span className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <DbIcon icon={r.icon} className="w-6 h-6" />
                </span>
                <h2 className="text-lg font-extrabold group-hover:text-primary transition">{r.nameFa}</h2>
                <span className="text-xs font-bold bg-primary/10 text-primary rounded-full px-2.5 py-1">
                  {(counts.get(r.id) ?? 0).toLocaleString("fa-IR")} برنامه
                </span>
                <span className="text-primary text-sm">←</span>
              </Link>
              {kids.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {kids.map((k) => (
                    <Link key={k.id} href={`/category/${k.slug}`}
                      className="text-sm bg-muted hover:bg-primary/10 hover:text-primary border border-border rounded-full px-4 py-2 transition flex items-center gap-1.5">
                      <DbIcon icon={k.icon} className="w-4 h-4" /> {k.nameFa}
                      <span className="text-xs text-muted-foreground font-bold">{(counts.get(k.id) ?? 0).toLocaleString("fa-IR")}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">زیرشاخه‌ای ثبت نشده است.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

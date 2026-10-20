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
      <span className="block font-mono text-[10.5px] text-primary mb-1" dir="ltr" style={{ textAlign: "right" }}>{"// categories"}</span>
      <h1 className="text-2xl font-extrabold mb-6">دسته‌بندی‌ها</h1>
      <div className="space-y-6">
        {roots.map((r) => {
          const kids = childrenOf(r.id);
          return (
            <section key={r.id} className="bg-surface border border-border rounded-lg p-5" aria-label={r.nameFa}>
              <Link href={`/category/${r.slug}`} className="flex items-center gap-3 mb-4 group">
                <span className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <DbIcon icon={r.icon} className="w-6 h-6" />
                </span>
                <h2 className="text-lg font-extrabold group-hover:text-primary transition">{r.nameFa}</h2>
                <span className="font-mono text-[11px] text-muted" dir="ltr">
                  {(counts.get(r.id) ?? 0).toLocaleString("en-US")} apps
                </span>
              </Link>
              {kids.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {kids.map((k) => (
                    <Link key={k.id} href={`/category/${k.slug}`}
                      className="text-sm bg-surface-2 hover:bg-primary-soft hover:text-primary border border-border rounded-lg px-3.5 py-1.5 transition flex items-center gap-1.5">
                      <DbIcon icon={k.icon} className="w-4 h-4" /> {k.nameFa}
                      <span className="font-mono text-[10.5px] text-muted" dir="ltr">{(counts.get(k.id) ?? 0).toLocaleString("en-US")}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">زیرشاخه‌ای ثبت نشده است.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

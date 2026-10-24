"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppIcon from "@/components/AppIcon";
import { px } from "@/lib/img";
import { getCompareList } from "@/components/CompareButton";
import { STR, dateL, type Locale } from "@/lib/i18n";
import { Scale, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CApp = {
  slug: string; nameFa: string; iconUrl: string | null; shortDescFa: string | null;
  versionName: string | null; fileSize: number | null; downloadCount: number;
  rating: number | null; categories: string; permCount: number; updatedAt: string;
};

export default function CompareClient({ locale = "fa" }: { locale?: Locale }) {
  const d = STR[locale];
  const fmt = (n: number | null | undefined): string => {
    if (n == null) return "—";
    return n.toLocaleString(locale === "fa" ? "fa-IR" : "en-US");
  };
  const [slugs, setSlugs] = useState<string[]>([]);
  const [apps, setApps] = useState<CApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = getCompareList();
    setSlugs(list);
    if (!list.length) { setLoading(false); return; }
    fetch(`/api/compare?slugs=${list.join(",")}`)
      .then((r) => r.json()).then((d) => { setApps(d.apps || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const remove = (slug: string) => {
    const list = getCompareList().filter((s) => s !== slug);
    localStorage.setItem("narm-compare", JSON.stringify(list));
    setSlugs(list); setApps(apps.filter((a) => a.slug !== slug));
  };
  const clear = () => {
    localStorage.removeItem("narm-compare");
    setSlugs([]); setApps([]);
  };

  if (loading) return <p className="text-muted-foreground">{d.cmp_loading}</p>;
  if (!apps.length) return (
    <div className="text-center py-16">
      <Scale className="w-12 h-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
      <p className="font-bold mb-2">{d.cmp_empty}</p>
      <p className="text-sm text-muted-foreground mb-6">{d.cmp_emptySub}</p>
      <Link href="/" className="text-primary font-bold">{d.cmp_backHome}</Link>
    </div>
  );

  const rows: [string, (a: CApp) => React.ReactNode][] = [
    [d.cmp_desc, (a) => <span className="text-xs text-muted-foreground line-clamp-3">{a.shortDescFa || "—"}</span>],
    [d.cmp_version, (a) => a.versionName || "—"],
    [d.cmp_size, (a) => a.fileSize ? `${(a.fileSize / 1048576).toLocaleString(locale === "fa" ? "fa-IR" : "en-US", { maximumFractionDigits: 1 })} ${d.cmp_megabyte}` : "—"],
    [d.cmp_downloads, (a) => fmt(a.downloadCount)],
    [d.cmp_rating, (a) => a.rating ? <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5" aria-hidden="true" /> {a.rating.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}</span> : "—"],
    [d.cmp_cats, (a) => <span className="text-xs">{a.categories || "—"}</span>],
    [d.cmp_perms, (a) => fmt(a.permCount)],
    [d.cmp_updated, (a) => a.updatedAt ? (locale === "fa" ? new Date(a.updatedAt).toLocaleDateString("fa-IR") : dateL(a.updatedAt, locale)) : "—"],
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{d.cmp_inList.replace("{n}", fmt(apps.length))}</p>
        <Button onClick={clear} variant="destructive" size="sm">{d.cmp_clearAll}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th className="w-28"></th>
              {apps.map((a) => (
                <th key={a.slug} className="p-3 align-top">
                  <div className="bg-card border border-border rounded-3xl p-4">
                    <AppIcon src={a.iconUrl ? px(a.iconUrl, "icon") || a.iconUrl : null} name={a.nameFa} width={64} height={64} imgClassName="w-16 h-16 rounded-2xl mx-auto mb-2 object-cover" letterClassName="w-16 h-16 rounded-2xl mx-auto mb-2 grid place-items-center bg-muted text-lg font-bold" alt={a.nameFa} />
                    <Link href={`/app/${a.slug}`} className="font-extrabold text-sm hover:text-primary block mb-2">{a.nameFa}</Link>
                    <Button onClick={() => remove(a.slug)} variant="ghost" size="sm" className="h-6 px-2 text-xs">{d.cmp_remove} ✕</Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} className="border-t border-border">
                <td className="py-3 px-2 text-sm font-bold text-muted-foreground whitespace-nowrap">{label}</td>
                {apps.map((a) => <td key={a.slug} className="py-3 px-3 text-sm text-center align-top">{fn(a)}</td>)}
              </tr>
            ))}
            <tr className="border-t border-border">
              <td></td>
              {apps.map((a) => (
                <td key={a.slug} className="py-4 px-3 text-center">
                  <Link href={`/app/${a.slug}`} className={cn(buttonVariants({ size: "lg" }), "rounded-2xl font-bold")}>{d.cmp_view}</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

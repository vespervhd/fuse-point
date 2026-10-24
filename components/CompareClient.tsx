"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { getCompareList } from "@/components/CompareButton";
import { Scale, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CApp = {
  slug: string; nameFa: string; iconUrl: string | null; shortDescFa: string | null;
  versionName: string | null; fileSize: number | null; downloadCount: number;
  rating: number | null; categories: string; permCount: number; updatedAt: string;
};

function fa(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("fa-IR");
}

export default function CompareClient() {
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

  if (loading) return <p className="text-muted-foreground">در حال بارگذاری...</p>;
  if (!apps.length) return (
    <div className="text-center py-16">
      <Scale className="w-12 h-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
      <p className="font-bold mb-2">لیست مقایسه خالی است</p>
      <p className="text-sm text-muted-foreground mb-6">از صفحه‌ی هر برنامه، «افزودن به مقایسه» را بزنید</p>
      <Link href="/" className="text-primary font-bold">← بازگشت به خانه</Link>
    </div>
  );

  const rows: [string, (a: CApp) => React.ReactNode][] = [
    ["توضیح", (a) => <span className="text-xs text-muted-foreground line-clamp-3">{a.shortDescFa || "—"}</span>],
    ["آخرین نسخه", (a) => fa(a.versionName as any) === "—" ? (a.versionName || "—") : a.versionName],
    ["حجم فایل", (a) => a.fileSize ? `${(a.fileSize / 1048576).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} مگابایت` : "—"],
    ["دانلودها", (a) => fa(a.downloadCount)],
    ["امتیاز", (a) => a.rating ? <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5" aria-hidden="true" /> {a.rating.toLocaleString("fa-IR")}</span> : "—"],
    ["دسته‌ها", (a) => <span className="text-xs">{a.categories || "—"}</span>],
    ["تعداد دسترسی‌ها", (a) => fa(a.permCount)],
    ["آخرین به‌روزرسانی", (a) => a.updatedAt ? new Date(a.updatedAt).toLocaleDateString("fa-IR") : "—"],
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{fa(apps.length)} برنامه در حال مقایسه</p>
        <Button onClick={clear} variant="destructive" size="sm">پاک کردن همه</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th className="w-28"></th>
              {apps.map((a) => (
                <th key={a.slug} className="p-3 align-top">
                  <div className="bg-card border border-border rounded-3xl p-4">
                    {a.iconUrl && <PxImg src={px(a.iconUrl) || ""} alt={a.nameFa} width={64} height={64} className="w-16 h-16 rounded-2xl mx-auto mb-2 object-cover" />}
                    <Link href={`/app/${a.slug}`} className="font-extrabold text-sm hover:text-primary block mb-2">{a.nameFa}</Link>
                    <Button onClick={() => remove(a.slug)} variant="ghost" size="sm" className="h-6 px-2 text-xs">حذف ✕</Button>
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
                  <Link href={`/app/${a.slug}`} className={cn(buttonVariants({ size: "lg" }), "rounded-2xl font-bold")}>مشاهده و دانلود</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionBySlug } from "@/lib/store";
import AppTile from "@/components/AppTile";
import CollectionPlatformSync from "@/components/CollectionPlatformSync";
import { toFaDigits } from "@/lib/fa";
import DbIcon from "@/components/DbIcon";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);
  if (!col) return { title: "یافت نشد" };
  return { title: col.nameFa, description: col.description || `کالکشن ${col.nameFa} در Fuse Point` };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);
  if (!col) notFound();
  // تشخیص پلتفرم از روی برنامه‌ها (کالکشن‌های ویندوز/لینوکس)
  const plat = col.apps.length > 0 ? (col.apps[0] as { platform?: string }).platform : undefined;
  const platform = plat === "windows" || plat === "linux" ? plat : "android";
  // ایزولاسیون پلتفرم: فقط برنامه‌های هم‌پلتفرم کالکشن نمایش داده می‌شوند
  const apps = col.apps.filter((a: any) => (a.platform ?? "android") === platform);

  return (
    <div className="animate-fade-up">
      <CollectionPlatformSync platform={platform} />
      <nav className="text-sm text-muted mb-4" aria-label="مسیر">
        <Link href="/" className="hover:text-primary">خانه</Link>
        <span className="mx-2">/</span>
        <Link href="/collections" className="hover:text-primary">کالکشن‌ها</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-bold">{col.nameFa}</span>
      </nav>

      <section className="rounded-3xl overflow-hidden border border-border bg-surface mb-8">
        <div className="p-6 sm:p-8 flex items-center gap-5">
          <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <DbIcon icon={col.icon} className="w-9 h-9 sm:w-11 sm:h-11" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{col.nameFa}</h1>
            <p className="text-sm text-muted mt-1">{toFaDigits(apps.length)} برنامه</p>
            {col.description && <p className="text-sm text-muted mt-2 leading-7">{col.description}</p>}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {apps.map((a: any, i: number) => <AppTile key={a.id} app={a} index={i} />)}
      </div>
    </div>
  );
}

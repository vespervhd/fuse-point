import Link from "next/link";
import type { Metadata } from "next";
import { getCollections } from "@/lib/store";
import type { Platform } from "@/lib/store";
import { toFaDigits } from "@/lib/fa";
import DbIcon from "@/components/DbIcon";

export const metadata: Metadata = { title: "کالکشن‌ها", description: "لیست‌های دست‌چین برنامه‌ها در Fuse Point" };

type Props = { searchParams: Promise<{ platform?: string }> };

export default async function CollectionsPage({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = (platform === "windows" || platform === "linux") ? platform : "android";
  const collections = await getCollections(plat);

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold mb-2">کالکشن‌ها</h1>
      <p className="text-sm text-muted-foreground mb-8">مجموعه‌های کاربردی از برنامه‌ها برای نیازهای مختلف</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {collections.map((c, i) => (
          <Link key={c.id} href={`/collection/${c.slug}`}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-card-in card-hover bg-card border border-border rounded-3xl p-6 flex items-center gap-5">
            <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <DbIcon icon={c.icon} className="w-8 h-8" />
            </span>
            <div className="flex-1">
              <h2 className="font-extrabold text-lg">{c.nameFa}</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-6 line-clamp-2">{c.description}</p>
              <p className="text-xs text-primary font-bold mt-2">{toFaDigits(c.appCount)} برنامه ←</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { ArrowLeftRight, ChevronLeft, Leaf } from "lucide-react";
import type { AlternativeEntry } from "@/data/alternatives";

type AltApp = {
  nameEn: string;
  why: string;
  slug: string;
  nameFa: string;
  iconUrl: string | null;
};

// بخش «جایگزین‌ها» با طراحی خاص: حاشیه گرادیانی، نشان تعویض، ردیف‌های متمایز
export default function Alternatives({
  entry,
  apps,
}: {
  entry: AlternativeEntry;
  apps: AltApp[]; // فقط اپ‌هایی که در DB پیدا شدند
}) {
  if (!apps.length) return null;

  return (
    <section aria-label={`جایگزین‌های ${entry.forFa}`} className="mt-8">
      {/* قاب گرادیانی متمایز */}
      <div className="rounded-3xl p-[2px] bg-gradient-to-bl from-primary via-primary/40 to-transparent">
        <div className="rounded-[22px] bg-card p-5 md:p-6 relative overflow-hidden">
          {/* نقش پس‌زمینه محو */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -left-10 w-44 h-44 rounded-full bg-primary/10 blur-2xl"
          />

          {/* سربرگ */}
          <div className="flex items-center gap-3 mb-1 relative">
            <span className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground grid place-items-center shrink-0 shadow-lg shadow-primary/25 -rotate-6">
              <ArrowLeftRight className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-head text-xl leading-tight">
                به‌جای <span className="text-muted-foreground">{entry.forFa}</span>…
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                جایگزین‌های آزاد و رایگان
              </p>
            </div>
          </div>

          {/* ردیف جایگزین‌ها */}
          <div className="mt-4 space-y-2.5 relative">
            {apps.map((a) => {
              const icon = px(a.iconUrl);
              return (
                <Link
                  key={a.slug}
                  href={`/app/${a.slug}`}
                  className="group flex items-center gap-3.5 rounded-2xl border border-dashed border-border hover:border-primary/60 hover:bg-primary/10 transition-all p-3"
                >
                  {/* آیکون */}
                  <span className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0 grid place-items-center">
                    {icon ? (
                      <PxImg src={icon} alt={a.nameFa} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-extrabold text-lg text-muted-foreground">{a.nameFa.slice(0, 1)}</span>
                    )}
                  </span>

                  {/* نام و دلیل */}
                  <span className="flex-1 min-w-0">
                    <span className="block font-extrabold text-[15px] leading-snug">{a.nameFa}</span>
                    <span className="block text-[13px] text-muted-foreground leading-relaxed mt-0.5">
                      <span className="text-primary font-bold">◂ </span>
                      {a.why}
                    </span>
                  </span>

                  {/* دکمه خاص مشاهده */}
                  <span className="shrink-0 inline-flex items-center gap-1 text-[13px] font-extrabold text-primary border border-primary/40 rounded-full px-3.5 py-1.5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                    مشاهده
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground mt-4 relative">
            این پیشنهادها دست‌چین شده‌اند؛ هرکدام برای یک نیاز خاص بهتر جواب می‌دهند.
          </p>
        </div>
      </div>
    </section>
  );
}

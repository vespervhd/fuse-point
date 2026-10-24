import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALTERNATIVES, findAlternatives } from "@/data/alternatives";
import { getAppByNameEn } from "@/lib/store";
import AppTile from "@/components/AppTile";
import PxImg from "@/components/PxImg";
import { px } from "@/lib/img";
import { ArrowLeft, Leaf } from "lucide-react";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function generateStaticParams() {
  return ALTERNATIVES.map((a) => ({ slug: slugify(a.for) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const d = STR[locale];
  const entry = ALTERNATIVES.find((a) => slugify(a.for) === slug);
  if (!entry) return { title: d.ext_notFound };
  const name = locale === "fa" ? entry.forFa : entry.for;
  return {
    title: `${d.ext_altPrefix} ${name}`,
    description: d.ext_altMetaDescSlug
      .replace("{name}", name)
      .replace("{list}", entry.alternatives.map((a) => a.nameEn).join(locale === "fa" ? "، " : ", ")),
  };
}

export default async function AlternativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const d = STR[locale];
  const entry = ALTERNATIVES.find((a) => slugify(a.for) === slug);
  if (!entry) notFound();
  const name = locale === "fa" ? entry.forFa : entry.for;

  const apps = [];
  for (const alt of entry.alternatives) {
    const app = await getAppByNameEn(alt.nameEn);
    if (app) apps.push({ app, why: alt.why });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/alternatives" className="inline-flex items-center gap-1 text-sm text-primary font-bold mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {d.ext_allAlternatives}
      </Link>

      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-full mb-4">
          <Leaf className="w-4 h-4" aria-hidden="true" /> {d.ext_altBadge}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">{d.ext_altPrefix} {name}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {d.ext_altIntro.replace("{name}", name)}
        </p>
      </div>

      {apps.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {apps.map(({ app, why }, i) => (
            <div key={app.id} className="flex flex-col">
              <AppTile app={app} index={i} locale={locale} />
              <p className="text-xs text-muted-foreground mt-2 leading-5 text-center">{why}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{d.ext_altComingSoon}</p>
      )}
    </div>
  );
}

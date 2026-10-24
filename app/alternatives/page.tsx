import type { Metadata } from "next";
import Link from "next/link";
import { ALTERNATIVES } from "@/data/alternatives";
import { Leaf } from "lucide-react";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = STR[locale];
  return {
    title: d.alternatives,
    description: d.ext_altMetaDesc,
  };
}

export default async function AlternativesIndex() {
  const locale = await getLocale();
  const d = STR[locale];
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <Leaf className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">{d.alternatives}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {d.ext_altSub}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ALTERNATIVES.map((a) => (
          <Link
            key={a.for}
            href={`/alternatives/${slugify(a.for)}`}
            className="bg-card border border-border rounded-2xl p-4 text-center font-bold hover:border-primary/50 hover:text-primary transition"
          >
            {d.ext_altPrefix} {locale === "fa" ? a.forFa : a.for}
            <span className="block text-xs text-muted-foreground font-normal mt-1">{d.ext_altOptions.replace("{n}", String(a.alternatives.length))}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

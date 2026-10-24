import type { Metadata } from "next";
import CompareClient from "@/components/CompareClient";
import { Scale } from "lucide-react";
import { getLocale } from "@/lib/i18n-server";
import { STR } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = STR[locale];
  return { title: d.ext_compare, description: d.ext_compareMetaDesc };
}

export default async function ComparePage() {
  const locale = await getLocale();
  const d = STR[locale];
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
        <Scale className="w-6 h-6 text-primary" aria-hidden="true" /> {d.ext_compare}
      </h1>
      <CompareClient locale={locale} />
    </div>
  );
}

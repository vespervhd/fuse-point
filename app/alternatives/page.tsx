import type { Metadata } from "next";
import Link from "next/link";
import { ALTERNATIVES } from "@/data/alternatives";
import { Leaf } from "lucide-react";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const metadata: Metadata = {
  title: "جایگزین‌های آزاد",
  description: "جایگزین‌های آزاد و متن‌باز برای برنامه‌های معروف: به‌جای واتساپ، گوگل مپ، کروم و...",
};

export default function AlternativesIndex() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <Leaf className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">جایگزین‌های آزاد</h1>
        <p className="text-muted max-w-2xl mx-auto">
          برای هر برنامه‌ی معروفی که به حریم خصوصی شما احترام نمی‌گذارد، یک جایگزین آزاد هست. این‌جا پیداش کنید.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ALTERNATIVES.map((a) => (
          <Link
            key={a.for}
            href={`/alternatives/${slugify(a.for)}`}
            className="bg-surface border border-border rounded-2xl p-4 text-center font-bold hover:border-primary/50 hover:text-primary transition"
          >
            جایگزین {a.forFa}
            <span className="block text-xs text-muted font-normal mt-1">{a.alternatives.length} گزینه</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

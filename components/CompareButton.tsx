"use client";
import { useEffect, useState } from "react";
import { Scale, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type App = { slug: string; nameFa: string };

export function getCompareList(): string[] {
  try { return JSON.parse(localStorage.getItem("narm-compare") || "[]"); }
  catch { return []; }
}

export default function CompareButton({ slug, nameFa }: App) {
  const [inList, setInList] = useState(false);

  useEffect(() => { setInList(getCompareList().includes(slug)); }, [slug]);

  const toggle = () => {
    let list = getCompareList();
    if (list.includes(slug)) list = list.filter((s) => s !== slug);
    else {
      if (list.length >= 3) { alert("حداکثر ۳ برنامه را می‌توانید مقایسه کنید"); return; }
      list.push(slug);
    }
    localStorage.setItem("narm-compare", JSON.stringify(list));
    setInList(list.includes(slug));
    window.dispatchEvent(new Event("narm-compare-changed"));
  };

  return (
    <Button onClick={toggle} size="sm"
      variant={inList ? "default" : "ghost"}>
      {inList ? <><Check className="w-4 h-4" aria-hidden="true" /> در لیست مقایسه</> : <><Scale className="w-4 h-4" aria-hidden="true" /> افزودن به مقایسه</>}
    </Button>
  );
}

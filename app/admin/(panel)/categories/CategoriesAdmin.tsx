"use client";
import { useEffect, useState } from "react";
import { STR, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Cat = {
  id: string; slug: string; nameFa: string; nameEn: string | null;
  icon: string | null; parentId: string | null; sortOrder: number; isActive: boolean;
};

export default function CategoriesAdmin({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState("");

  const load = () => fetch("/api/admin/categories").then((r) => r.json()).then((j) => {
    setCats(j.categories || []); setLoading(false);
  });
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!nameFa.trim()) return;
    setMsg("");
    const r = await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameFa: nameFa.trim(), icon: icon.trim() || null, parentId: parentId || null }),
    });
    const j = await r.json();
    if (r.ok) { setNameFa(""); setIcon(""); setParentId(""); load(); }
    else setMsg(`❌ ${j.error || d.adm_errGeneric}`);
  };

  const toggle = async (c: Cat) => {
    await fetch("/api/admin/categories", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
    });
    load();
  };

  const remove = async (c: Cat) => {
    if (!confirm(d.adm_catDeleteConfirm.replace("{name}", c.nameFa))) return;
    const r = await fetch("/api/admin/categories", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id }),
    });
    const j = await r.json();
    setMsg(j.soft ? `ℹ️ ${j.message}` : "");
    load();
  };


  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="text-2xl font-extrabold mb-6">{d.cats}</h1>
      {msg && <p role={msg.startsWith("❌") ? "alert" : "status"} className={`mb-4 text-sm border rounded-xl p-3 ${msg.startsWith("❌") ? "text-destructive bg-destructive/10 border-destructive/30" : "text-info bg-info/10 border-info/30"}`}>{msg}</p>}

      <div className="bg-card border border-border rounded-3xl p-6 mb-6">
        <h2 className="font-bold mb-3">{d.adm_newCat}</h2>
        <div className="flex flex-wrap gap-3">
          <Input className="h-11 flex-1 min-w-40" placeholder={d.adm_nameFa} value={nameFa} onChange={(e) => setNameFa(e.target.value)} />
          <Input className="h-11 w-24" placeholder={d.adm_phIcon} value={icon} onChange={(e) => setIcon(e.target.value)} />
          <Select value={parentId || "__root__"} onValueChange={(v) => setParentId(v === "__root__" ? "" : v)}>
            <SelectTrigger className="h-11 min-w-44">
              <SelectValue placeholder={d.adm_noParent} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__root__">{d.adm_noParent}</SelectItem>
              {cats.filter((c) => !c.parentId).map((c) => <SelectItem key={c.id} value={c.id}>{c.nameFa}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={create}>{d.adm_submit}</Button>
        </div>
      </div>

      {loading ? <Skeleton className="h-40 rounded-3xl border border-border" /> : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <ul className="divide-y divide-border">
            {cats.map((c) => (
              <li key={c.id} className={`flex items-center gap-3 p-4 ${!c.isActive ? "opacity-50" : ""}`}>
                <span className="text-2xl" aria-hidden="true">{c.icon || "📦"}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm">{c.parentId ? "↳ " : ""}{c.nameFa}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr" style={{ textAlign: "right" }}>{c.slug}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggle(c)} className="h-7 px-2 text-xs">
                  {c.isActive ? d.adm_deactivate : d.adm_activate}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => remove(c)} className="h-7 px-2 text-xs">{d.adm_delete}</Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

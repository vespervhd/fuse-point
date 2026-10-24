"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { STR, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewAppForm({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ packageName: "", nameFa: "", nameEn: "", shortDesc: "", iconUrl: "", license: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setMsg(""); setSaving(true);
    const r = await fetch("/api/admin/apps", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, isPublished: false }),
    });
    const j = await r.json();
    if (r.ok) router.push(`/admin/apps/${j.id}`);
    else { setMsg(`❌ ${j.error || d.adm_errGeneric}`); setSaving(false); }
  };

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/apps" className="text-primary hover:underline text-sm">{d.adm_back}</Link>
        <h1 className="text-2xl font-extrabold">{d.adm_newAppTitle}</h1>
      </div>
      {msg && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl p-3">{msg}</p>}
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <div><label className="block text-xs font-bold mb-1.5">{d.adm_packageName}</label>
          <Input className="h-11 bg-muted" dir="ltr" value={f.packageName} onChange={(e) => set("packageName", e.target.value)} placeholder="com.example.app" /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold mb-1.5">{d.adm_nameFaReq}</label>
            <Input className="h-11 bg-muted" value={f.nameFa} onChange={(e) => set("nameFa", e.target.value)} /></div>
          <div><label className="block text-xs font-bold mb-1.5">{d.adm_nameEnReq}</label>
            <Input className="h-11 bg-muted" dir="ltr" value={f.nameEn} onChange={(e) => set("nameEn", e.target.value)} /></div>
        </div>
        <div><label className="block text-xs font-bold mb-1.5">{d.adm_shortDesc}</label>
          <Input className="h-11 bg-muted" value={f.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} /></div>
        <div><label className="block text-xs font-bold mb-1.5">{d.adm_iconUrl}</label>
          <Input className="h-11 bg-muted" dir="ltr" value={f.iconUrl} onChange={(e) => set("iconUrl", e.target.value)} /></div>
        <div><label className="block text-xs font-bold mb-1.5">{d.license}</label>
          <Input className="h-11 bg-muted" dir="ltr" value={f.license} onChange={(e) => set("license", e.target.value)} placeholder="GPL-3.0-only" /></div>
        <Button onClick={save} disabled={saving || !f.packageName || !f.nameFa || !f.nameEn}>
          {saving ? d.adm_submitting : d.adm_submitDraft}
        </Button>
        <p className="text-xs text-muted-foreground">{d.adm_newAppNote}</p>
      </div>
    </div>
  );
}

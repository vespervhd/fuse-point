"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { STR, num, dateL, bytesL, type Locale, type Dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Version = {
  id: string; versionName: string; versionCode: number; fileUrl: string;
  fileSize: number | null; sha256: string | null; status: string;
  isCurrent: boolean; createdAt: string; minSdk: number | null;
};

const statusLabel = (d: Dict, status: string): string | undefined => {
  if (status === "pending") return d.adm_verStatus_pending;
  if (status === "active") return d.adm_verStatus_active;
  if (status === "disabled") return d.adm_verStatus_disabled;
  if (status === "rejected") return d.adm_verStatus_rejected;
  return undefined;
};

export default function EditApp({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<any>({});
  const [versions, setVersions] = useState<Version[]>([]);
  const [cats, setCats] = useState<{ id: string; nameFa: string }[]>([]);
  const [catIds, setCatIds] = useState<string[]>([]);
  const [newVer, setNewVer] = useState({ versionName: "", versionCode: "", fileUrl: "", fileSize: "", sha256: "", minSdk: "", changelog: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/apps/${id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([a, c]) => {
      if (a.app) {
        setForm(a.app);
        setVersions(a.versions || []);
        setCatIds(a.categoryIds || []);
      }
      setCats((c.categories || []).map((x: any) => ({ id: x.id, nameFa: `${x.parentId ? "↳ " : ""}${x.nameFa}` })));
      setLoading(false);
    });
  }, [id]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true); setMsg("");
    const r = await fetch(`/api/admin/apps/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, categoryIds: catIds }),
    });
    const j = await r.json();
    setMsg(r.ok ? d.adm_saved : `❌ ${j.error || d.adm_errGeneric}`);
    setSaving(false);
  };

  const addVersion = async () => {
    setMsg("");
    const r = await fetch(`/api/admin/apps/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        versionName: newVer.versionName,
        versionCode: Number(newVer.versionCode),
        fileUrl: newVer.fileUrl,
        fileSize: newVer.fileSize ? Number(newVer.fileSize) : null,
        sha256: newVer.sha256 || null,
        minSdk: newVer.minSdk ? Number(newVer.minSdk) : null,
        changelog: newVer.changelog || null,
      }),
    });
    const j = await r.json();
    if (r.ok) {
      setMsg(d.adm_verAdded);
      setNewVer({ versionName: "", versionCode: "", fileUrl: "", fileSize: "", sha256: "", minSdk: "", changelog: "" });
      const fresh = await fetch(`/api/admin/apps/${id}`).then((x) => x.json());
      setVersions(fresh.versions || []);
    } else setMsg(`❌ ${j.error || d.adm_errGeneric}`);
  };

  const verAction = async (vid: string, body: any) => {
    const r = await fetch(`/api/admin/versions/${vid}`, {
      method: body._delete ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: body._delete ? undefined : JSON.stringify(body),
    });
    if (r.ok) {
      const fresh = await fetch(`/api/admin/apps/${id}`).then((x) => x.json());
      setVersions(fresh.versions || []);
    }
  };

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-3xl border border-border" />)}</div>;


  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/apps" className="text-primary hover:underline text-sm">{d.adm_back}</Link>
        <h1 className="text-2xl font-extrabold">{d.adm_editPrefix} {form.nameFa}</h1>
      </div>

      {msg && <p role={msg.startsWith("❌") ? "alert" : "status"} className={`mb-4 text-sm border rounded-xl p-3 ${msg.startsWith("❌") ? "text-destructive bg-destructive/10 border-destructive/30" : "text-success bg-success/10 border-success/30"}`}>{msg}</p>}

      <section className="bg-card border border-border rounded-3xl p-6 mb-6">
        <h2 className="font-extrabold mb-4">{d.adm_mainInfo}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold mb-1.5">{d.adm_nameFa}</label>
            <Input className="h-11 bg-muted" value={form.nameFa || ""} onChange={(e) => set("nameFa", e.target.value)} /></div>
          <div><label className="block text-xs font-bold mb-1.5">{d.adm_nameEn}</label>
            <Input className="h-11 bg-muted" dir="ltr" value={form.nameEn || ""} onChange={(e) => set("nameEn", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="block text-xs font-bold mb-1.5">{d.adm_shortDesc}</label>
            <Input className="h-11 bg-muted" value={form.shortDesc || ""} onChange={(e) => set("shortDesc", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="block text-xs font-bold mb-1.5">{d.adm_fullDesc}</label>
            <Textarea className="h-32 bg-muted" value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></div>
          <div><label className="block text-xs font-bold mb-1.5">{d.adm_iconUrl}</label>
            <Input className="h-11 bg-muted" dir="ltr" value={form.iconUrl || ""} onChange={(e) => set("iconUrl", e.target.value)} /></div>
          <div><label className="block text-xs font-bold mb-1.5">{d.license}</label>
            <Input className="h-11 bg-muted" dir="ltr" value={form.license || ""} onChange={(e) => set("license", e.target.value)} /></div>
          <div><label className="block text-xs font-bold mb-1.5">{d.source}</label>
            <Input className="h-11 bg-muted" dir="ltr" value={form.sourceUrl || ""} onChange={(e) => set("sourceUrl", e.target.value)} /></div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 text-sm">
            {[["isPublished", d.adm_published], ["featured", d.adm_featured], ["editorChoice", d.adm_editorChoice], ["isOpenSource", d.adm_openSource]].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)} className="size-4 shrink-0 accent-primary" />{l}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-bold mb-1.5">{d.cats}</label>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <Button key={c.id} type="button"
                onClick={() => setCatIds((p) => p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id])}
                variant={catIds.includes(c.id) ? "default" : "ghost"} size="sm"
                className="h-7 rounded-full px-2.5 text-xs">
                {c.nameFa}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={save} disabled={saving}
          className="mt-6">
          {saving ? d.adm_saving : d.adm_saveChanges}
        </Button>
      </section>

      <section className="bg-card border border-border rounded-3xl p-6 mb-6">
        <h2 className="font-extrabold mb-4">{d.adm_versions} ({num(versions.length, locale)})</h2>
        <ul className="space-y-3 mb-6">
          {versions.map((v) => (
            <li key={v.id} className="border border-border rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="font-bold"><span dir="ltr">v{v.versionName}</span>
                    <span className="text-xs text-muted-foreground font-normal ms-2" dir="ltr">({v.versionCode})</span>
                    {v.isCurrent && <Badge variant="outline" className="ms-2 bg-primary/10 text-primary">{d.adm_current}</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{statusLabel(d, v.status)} • {bytesL(v.fileSize, locale)} • {dateL(v.createdAt, locale)}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  {v.status !== "active" && (
                    <Button size="sm" onClick={() => verAction(v.id, { status: "active" })}>{d.adm_approvePublish}</Button>
                  )}
                  {v.status === "active" && !v.isCurrent && (
                    <Button variant="ghost" size="sm" onClick={() => verAction(v.id, { isCurrent: true })}>{d.adm_makeCurrent}</Button>
                  )}
                  {v.status === "pending" && (
                    <Button variant="destructive" size="sm" onClick={() => verAction(v.id, { status: "rejected" })}>{d.adm_reject}</Button>
                  )}
                  {v.status === "active" && (
                    <Button variant="outline" size="sm" onClick={() => verAction(v.id, { _delete: true })}
                      className="text-destructive hover:border-destructive hover:text-destructive">{d.adm_deactivate}</Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="font-bold mb-3">{d.adm_addVersion}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input className="h-11 bg-muted" dir="ltr" placeholder={d.adm_phVersionName} value={newVer.versionName}
            onChange={(e) => setNewVer({ ...newVer, versionName: e.target.value })} />
          <Input className="h-11 bg-muted" dir="ltr" placeholder={d.adm_phVersionCode} value={newVer.versionCode}
            onChange={(e) => setNewVer({ ...newVer, versionCode: e.target.value })} />
          <Input className="h-11 bg-muted sm:col-span-2" dir="ltr" placeholder={d.adm_phFileUrl} value={newVer.fileUrl}
            onChange={(e) => setNewVer({ ...newVer, fileUrl: e.target.value })} />
          <Input className="h-11 bg-muted" dir="ltr" placeholder={d.adm_phFileSize} value={newVer.fileSize}
            onChange={(e) => setNewVer({ ...newVer, fileSize: e.target.value })} />
          <Input className="h-11 bg-muted" dir="ltr" placeholder={d.adm_phSha} value={newVer.sha256}
            onChange={(e) => setNewVer({ ...newVer, sha256: e.target.value })} />
          <Input className="h-11 bg-muted" dir="ltr" placeholder="minSdk" value={newVer.minSdk}
            onChange={(e) => setNewVer({ ...newVer, minSdk: e.target.value })} />
          <Textarea className="sm:col-span-2 h-20 bg-muted" placeholder={d.adm_phChangelog} value={newVer.changelog}
            onChange={(e) => setNewVer({ ...newVer, changelog: e.target.value })} />
        </div>
        <Button onClick={addVersion} className="mt-4">
          {d.adm_submitVersion}
        </Button>
      </section>
    </div>
  );
}

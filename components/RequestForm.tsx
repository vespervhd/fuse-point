"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import { STR, platName, type Locale } from "@/lib/i18n";

const PLATFORMS = ["android", "windows", "linux"] as const;
type Platform = (typeof PLATFORMS)[number];

const inputCls =
  "w-full bg-input border border-border rounded-xl px-3.5 py-3 text-[14.5px] text-foreground outline-none focus:border-primary placeholder:text-muted-foreground";

// فرم «درخواست اپ» — نام اجباری، لینک منبع، پلتفرم سگمنتی، توضیح؛ ثبت در حساب کاربر
export default function RequestForm({ locale, initialPlatform }: { locale: Locale; initialPlatform: Platform }) {
  const d = STR[locale];
  const router = useRouter();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr(d.reqNameErr);
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: name.trim(), sourceLink: link.trim() || null, platform, note: note.trim() || null }),
      });
      if (r.status === 401) {
        router.push("/login?next=/request");
        return;
      }
      if (!r.ok) throw new Error();
      setDone(true);
      setName(""); setLink(""); setNote("");
      router.refresh();
    } catch {
      setErr(locale === "fa" ? "ثبت نشد؛ دوباره تلاش کن." : "Couldn't submit — try again.");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="flex items-start gap-3 bg-card border border-success/40 rounded-[18px] p-[18px]" role="status">
        <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-extrabold text-[15px] m-0">{d.reqDone}</p>
          <button
            type="button"
            onClick={() => setDone(false)}
            className="text-primary text-[13px] font-bold mt-2 hover:underline"
          >
            {locale === "fa" ? "ثبت یک درخواست دیگر" : "Submit another request"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-[18px] p-[18px] flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="rq-name" className="block text-[13px] font-bold mb-1.5">{d.reqName} *</label>
        <input id="rq-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)}
          placeholder={locale === "fa" ? "مثلاً Signal" : "e.g. Signal"} dir="auto" />
        {err && <p className="text-destructive text-[12.5px] mt-1.5" role="alert">{err}</p>}
      </div>
      <div>
        <label htmlFor="rq-link" className="block text-[13px] font-bold mb-1.5">{d.reqLink}</label>
        <input id="rq-link" className={inputCls} value={link} onChange={(e) => setLink(e.target.value)}
          placeholder="https://…" dir="ltr" inputMode="url" />
      </div>
      <div>
        <span className="block text-[13px] font-bold mb-1.5">{d.platform}</span>
        <div className="inline-flex bg-input border border-border rounded-full p-1 gap-0.5" role="group" aria-label={d.platform}>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              aria-pressed={platform === p}
              className={`px-4 py-2 rounded-full text-[13px] transition-colors ${
                platform === p ? "bg-primary text-primary-foreground font-extrabold" : "text-muted-foreground font-medium"
              }`}
            >
              {platName(locale, p)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="rq-note" className="block text-[13px] font-bold mb-1.5">{d.reqDesc}</label>
        <textarea id="rq-note" className={inputCls} rows={3} value={note} onChange={(e) => setNote(e.target.value)} dir="auto" />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-extrabold rounded-xl px-5 py-3 text-[14.5px] disabled:opacity-60"
      >
        <Send className="w-4 h-4 flip-x" aria-hidden="true" />
        {busy ? (locale === "fa" ? "در حال ثبت…" : "Submitting…") : d.reqSubmit}
      </button>
    </form>
  );
}

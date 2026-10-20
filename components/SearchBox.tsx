"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import PxImg from "./PxImg";

type Suggestion = {
  slug: string;
  nameFa: string;
  nameEn: string;
  iconUrl: string | null;
  platform: string;
};

function platformQs(sp: URLSearchParams): string {
  const p = sp.get("platform");
  let stored: string | null = null;
  try {
    stored = localStorage.getItem("narm-platform");
  } catch {}
  const plat = p === "windows" || p === "linux" ? p
    : stored === "windows" || stored === "linux" ? stored : null;
  return plat ? `&platform=${plat}` : "";
}

function SearchBoxInner({ compact = false, slim = false, large = false, cmdk = false }: { compact?: boolean; slim?: boolean; large?: boolean; cmdk?: boolean }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hi, setHi] = useState(-1);
  const router = useRouter();
  const sp = useSearchParams();
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const query = q.trim();
    if (query.length < 2) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/suggest?q=${encodeURIComponent(query)}${platformQs(sp)}`);
        const j = await r.json();
        setItems(Array.isArray(j.items) ? j.items : []);
        setHi(-1);
        setOpen(true);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, sp]);

  const goSearch = (query: string) => {
    const t = query.trim();
    if (!t) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(t)}${platformQs(sp)}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hi >= 0 && items[hi]) {
      setOpen(false);
      router.push(`/app/${items[hi].slug}`);
    } else {
      goSearch(q);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      setHi((h) => (h + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      setHi((h) => (h - 1 + items.length) % items.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const h = large ? "h-12" : slim ? "h-10" : "h-11";
  const radius = large ? "rounded-2xl" : "rounded-xl";

  return (
    <div ref={boxRef} className={`relative ${compact ? "w-full" : "w-full max-w-xl"}`}>
      {cmdk ? (
        <form
          onSubmit={submit}
          role="search"
          className="flex items-center gap-2.5 bg-surface border border-border rounded-lg px-3 h-12 focus-within:border-primary transition-colors"
        >
          <span aria-hidden="true" className="font-mono font-bold text-primary shrink-0">&gt;</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => { if (items.length > 0) setOpen(true); }}
            onKeyDown={onKey}
            placeholder="جست‌وجوی برنامه، مثلاً firefox…"
            aria-label="جست‌وجوی برنامه‌ها"
            autoComplete="off"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-fg placeholder:text-muted"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-muted" aria-hidden="true" />
          ) : (
            <kbd className="font-mono text-[10px] text-muted border border-border border-b-2 rounded px-1.5 py-px bg-surface-2 shrink-0" dir="ltr">
              Ctrl K
            </kbd>
          )}
        </form>
      ) : (
        <form onSubmit={submit} role="search" className="relative">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => { if (items.length > 0) setOpen(true); }}
            onKeyDown={onKey}
            placeholder="جست‌وجوی برنامه‌ها..."
            aria-label="جست‌وجوی برنامه‌ها"
            autoComplete="off"
            className={`w-full ${h} ${radius} bg-surface-2 border border-border pe-11 ps-4 text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm`}
          />
          <button
            type="submit"
            aria-label="جست‌وجو"
            className={`absolute end-1 top-1/2 -translate-y-1/2 btn btn-primary ${large ? "rounded-xl" : "btn-sm rounded-lg"} shrink-0`}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              : <Search className="w-4 h-4" strokeWidth={2} aria-hidden="true" />}
          </button>
        </form>
      )}

      {open && items.length > 0 && (
        <div
          className={`absolute top-full mt-2 inset-x-0 z-50 bg-surface border border-border shadow-xl overflow-hidden animate-fade-up ${cmdk ? "rounded-lg" : "rounded-xl"}`}
          role="listbox"
          aria-label="پیشنهادهای جست‌وجو"
        >
          <ul className="max-h-80 overflow-y-auto py-1">
            {items.map((s, i) => (
              <li key={s.slug} role="option" aria-selected={i === hi}>
                <Link
                  href={`/app/${s.slug}`}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setHi(i)}
                  className={`flex items-center gap-3 px-3 py-2.5 transition ${i === hi ? "bg-surface-2" : ""}`}
                >
                  {s.iconUrl ? (
                    <PxImg src={s.iconUrl} alt="" width={32} height={32} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {s.nameFa.charAt(0)}
                    </span>
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold truncate">{s.nameFa}</span>
                    {s.nameEn && s.nameEn !== s.nameFa && (
                      <span className="block text-xs text-muted truncate" dir="ltr" style={{ textAlign: "right" }}>{s.nameEn}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => goSearch(q)}
            className="btn btn-ghost w-full"
          >
            دیدن همه‌ی نتایج «{q.trim()}»
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchBox({ compact = false, slim = false, large = false, cmdk = false }: { compact?: boolean; slim?: boolean; large?: boolean; cmdk?: boolean }) {
  return (
    <Suspense fallback={null}>
      <SearchBoxInner compact={compact} slim={slim} large={large} cmdk={cmdk} />
    </Suspense>
  );
}

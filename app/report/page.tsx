"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

const TYPES = [
  ["broken_link", "لینک دانلود خراب است"],
  ["wrong_info", "اطلاعات برنامه نادرست است"],
  ["malware_suspicion", "ظن به بدافزار"],
  ["other", "سایر موارد"],
] as const;

function Form() {
  const sp = useSearchParams();
  const [app, setApp] = useState(sp.get("app") || "");
  const [type, setType] = useState<string>("broken_link");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appSlug: app.trim() || undefined, type, message: message.trim() }),
      });
      setStatus(r.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="bg-surface border border-border rounded-3xl p-10 text-center max-w-xl mx-auto">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-primary" aria-hidden="true" />
        <p className="font-extrabold mb-1">گزارش شما ثبت شد</p>
        <p className="text-sm text-muted">تیم Fuse Point آن را بررسی می‌کند. ممنون از همراهی شما!</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-xl mx-auto space-y-5">
      <div>
        <label htmlFor="app" className="block text-sm font-bold mb-2">نام یا نشانی برنامه (اختیاری)</label>
        <input id="app" value={app} onChange={(e) => setApp(e.target.value)} dir="ltr"
          placeholder="مثلاً vlc یا org.videolan.vlc"
          className="w-full h-11 rounded-xl bg-surface-2 border border-border px-4 text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-bold mb-2">نوع مشکل</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value)}
          className="select select-bordered w-full">
          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="msg" className="block text-sm font-bold mb-2">شرح مشکل</label>
        <textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
          placeholder="لطفاً دقیق بنویسید چه مشکلی دیدید..."
          className="w-full rounded-xl bg-surface-2 border border-border p-4 text-sm leading-7 focus:outline-none focus:border-primary" />
      </div>
      {status === "error" && <p className="text-sm text-danger">دریافت اطلاعات با خطا مواجه شد. لطفاً دوباره تلاش کنید.</p>}
      <button type="submit" disabled={status === "sending"}
        className="btn btn-primary w-full">
        {status === "sending" ? "در حال ارسال..." : "ثبت گزارش"}
      </button>
    </form>
  );
}

export default function ReportPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold mb-2 text-center">گزارش مشکل</h1>
      <p className="text-sm text-muted mb-8 text-center">لینک خراب دیدید یا اطلاعات اشتباهی پیدا کردید؟ به ما بگید تا درستش کنیم.</p>
      <Suspense><Form /></Suspense>
    </div>
  );
}

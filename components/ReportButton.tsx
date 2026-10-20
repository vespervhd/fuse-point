"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

export default function ReportButton({ appId, appName }: { appId: string; appName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSending(true);
    try {
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, reason, detail }),
      });
      if (r.ok) {
        setDone(true);
        setOpen(false);
      }
    } catch {}
    setSending(false);
  };

  if (done) {
    return (
      <p className="text-sm text-muted flex items-center gap-2">
        <Flag className="w-4 h-4" /> گزارش شما ثبت شد، بررسی می‌کنیم
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-muted text-[12.5px] font-medium hover:text-fg transition-colors"
      >
        <Flag className="w-3.5 h-3.5" /> گزارش مشکل
      </button>
      {open && (
        <div className="mt-3 bg-surface-2 border border-border rounded-lg p-4 text-start">
          <p className="text-sm font-bold mb-2">مشکل «{appName}» چیه؟</p>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="select select-bordered w-full select-sm mb-2"
          >
            <option value="">انتخاب کن…</option>
            <option value="broken-link">لینک دانلود خرابه</option>
            <option value="wrong-info">اطلاعات اشتباهه</option>
            <option value="malware">مشکوک به بدافزار</option>
            <option value="other">مورد دیگه</option>
          </select>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="توضیح بیشتر (اختیاری)"
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm mb-2"
            rows={2}
          />
          <button
            onClick={submit}
            disabled={!reason || sending}
            className="btn btn-primary btn-sm"
          >
            {sending ? "در حال ارسال…" : "ثبت گزارش"}
          </button>
        </div>
      )}
    </div>
  );
}

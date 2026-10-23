"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (r.ok) router.push("/admin");
      else setError(j.error || "خطا در ورود");
    } catch {
      setError("دریافت اطلاعات با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm bg-surface border border-border rounded-3xl p-8 space-y-5">
        <div className="text-center">
          <img src="/icons/icon-192.png" alt="لوگوی Fuse Point" width={48} height={48} className="inline-flex w-12 h-12 rounded-2xl object-cover mb-3" />
          <h1 className="text-xl font-extrabold">ورود به پنل مدیریت</h1>
          <p className="text-xs text-muted mt-1">Fuse Point — دسترسی محدود</p>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-2">ایمیل</label>
          <input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-xl bg-surface-2 border border-border px-4 text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold mb-2">رمز عبور</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl bg-surface-2 border border-border px-4 text-sm focus:outline-none focus:border-primary" />
        </div>
        {error && <p className="text-sm text-danger bg-danger/10 rounded-xl p-3">{error}</p>}
        <button type="submit" disabled={loading}
          className="btn btn-primary w-full">
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}

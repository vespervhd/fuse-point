"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const input = "w-full h-11 rounded-xl bg-surface-2 border border-border px-4 text-sm focus:outline-none focus:border-primary";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const j = await r.json();
      if (r.ok) { router.push("/"); router.refresh(); }
      else setError(j.error || "خطا در ثبت‌نام");
    } catch { setError("دریافت اطلاعات با خطا مواجه شد"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm bg-surface border border-border rounded-3xl p-8 space-y-5">
        <div className="text-center">
          <img src="/icons/icon-192.png" alt="لوگوی Fuse Point" width={48} height={48} className="inline-flex w-12 h-12 rounded-2xl object-cover mb-3" />
          <h1 className="text-xl font-extrabold">ساخت حساب کاربری</h1>
          <p className="text-xs text-muted mt-1">علاقه‌مندی‌ها و نظرات شما ذخیره می‌شود</p>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-bold mb-2">نام</label>
          <input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-2">ایمیل</label>
          <input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold mb-2">رمز عبور</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
          <p className="text-xs text-muted mt-1">حداقل ۸ کاراکتر</p>
        </div>
        {error && <p className="text-sm text-danger bg-danger/10 rounded-xl p-3">{error}</p>}
        <button type="submit" disabled={loading}
          className="btn btn-primary w-full">
          {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </button>
        <p className="text-center text-sm text-muted">
          حساب دارید؟ <Link href="/login" className="text-primary font-bold hover:underline">وارد شوید</Link>
        </p>
      </form>
    </div>
  );
}

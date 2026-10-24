"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/Logo";
import type { Locale } from "@/lib/i18n";

const COPY = {
  fa: { title: "ورود به حساب", email: "ایمیل", password: "رمز عبور", submit: "ورود", busy: "در حال ورود…", noAccount: "حساب نداری؟", signup: "ثبت‌نام کن", errLogin: "خطا در ورود", errNet: "دریافت اطلاعات با خطا مواجه شد" },
  en: { title: "Sign in", email: "Email", password: "Password", submit: "Sign in", busy: "Signing in…", noAccount: "No account?", signup: "Create one", errLogin: "Sign-in failed", errNet: "Something went wrong — try again" },
} as const;

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState<Locale>("fa");
  const router = useRouter();
  const sp = useSearchParams();
  const c = COPY[locale];

  useEffect(() => {
    if (document.documentElement.lang === "en") setLocale("en");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (r.ok) {
        const next = sp.get("next");
        const dest = j.user?.role && j.user.role !== "user"
          ? "/admin"
          : next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
        router.push(dest);
        router.refresh();
      } else setError(j.error || c.errLogin);
    } catch { setError(c.errNet); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 space-y-5">
        <div className="text-center">
          <span className="inline-grid place-items-center mb-3"><LogoMark size={48} /></span>
          <h1 className="text-xl font-extrabold">{c.title}</h1>
        </div>
        <div>
          <Label htmlFor="email" className="font-bold mb-2">{c.email}</Label>
          <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-muted" />
        </div>
        <div>
          <Label htmlFor="password" className="font-bold mb-2">{c.password}</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-muted" />
        </div>
        {error && <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl p-3">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? c.busy : c.submit}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {c.noAccount} <Link href="/signup" className="text-primary font-bold hover:underline">{c.signup}</Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

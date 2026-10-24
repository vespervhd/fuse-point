"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/Logo";
import type { Locale } from "@/lib/i18n";

const COPY = {
  fa: { title: "ساخت حساب کاربری", sub: "نشان‌ها و پیگیری‌هات ذخیره می‌شه", name: "نام", email: "ایمیل", password: "رمز عبور", min: "حداقل ۸ کاراکتر", submit: "ثبت‌نام", busy: "در حال ثبت‌نام…", have: "حساب داری؟", login: "وارد شو", errSignup: "خطا در ثبت‌نام", errNet: "دریافت اطلاعات با خطا مواجه شد" },
  en: { title: "Create account", sub: "Your bookmarks and follows are saved", name: "Name", email: "Email", password: "Password", min: "At least 8 characters", submit: "Sign up", busy: "Creating…", have: "Already have an account?", login: "Sign in", errSignup: "Sign-up failed", errNet: "Something went wrong — try again" },
} as const;

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState<"fa" | "en">("fa");
  const router = useRouter();
  const c = COPY[locale];

  useEffect(() => {
    if (document.documentElement.lang === "en") setLocale("en");
  }, []);

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
      else setError(j.error || c.errSignup);
    } catch { setError(c.errNet); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 space-y-5">
        <div className="text-center">
          <span className="inline-grid place-items-center mb-3"><LogoMark size={48} /></span>
          <h1 className="text-xl font-extrabold">{c.title}</h1>
          <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
        </div>
        <div>
          <Label htmlFor="name" className="font-bold mb-2">{c.name}</Label>
          <Input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-muted" />
        </div>
        <div>
          <Label htmlFor="email" className="font-bold mb-2">{c.email}</Label>
          <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-muted" />
        </div>
        <div>
          <Label htmlFor="password" className="font-bold mb-2">{c.password}</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-muted" />
          <p className="text-xs text-muted-foreground mt-1">{c.min}</p>
        </div>
        {error && <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl p-3">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? c.busy : c.submit}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {c.have} <Link href="/login" className="text-primary font-bold hover:underline">{c.login}</Link>
        </p>
      </form>
    </div>
  );
}

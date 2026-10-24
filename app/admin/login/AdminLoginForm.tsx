"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { STR, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginForm({ locale }: { locale: Locale }) {
  const d = STR[locale];
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
      else setError(j.error || d.adm_loginErr);
    } catch {
      setError(d.adm_netErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 space-y-5">
        <div className="text-center">
          <img src="/icons/icon-192.png" alt={d.adm_logoAlt} width={48} height={48} className="inline-flex w-12 h-12 rounded-2xl object-cover mb-3" />
          <h1 className="text-xl font-extrabold">{d.adm_loginTitle}</h1>
          <p className="text-xs text-muted-foreground mt-1">{d.adm_loginSub}</p>
        </div>
        <div>
          <Label htmlFor="email" className="font-bold mb-2">{d.email}</Label>
          <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-muted" />
        </div>
        <div>
          <Label htmlFor="password" className="font-bold mb-2">{d.password}</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="h-11 bg-muted" />
        </div>
        {error && <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl p-3">{error}</p>}
        <Button type="submit" disabled={loading}
          className="w-full">
          {loading ? d.adm_loggingIn : d.login}
        </Button>
      </form>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <div className="bg-card border border-border rounded-3xl p-10 text-center max-w-xl mx-auto">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-primary" aria-hidden="true" />
        <p className="font-extrabold mb-1">گزارش شما ثبت شد</p>
        <p className="text-sm text-muted-foreground">تیم Fuse Point آن را بررسی می‌کند. ممنون از همراهی شما!</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-xl mx-auto space-y-5">
      <div>
        <Label htmlFor="app" className="font-bold mb-2">نام یا نشانی برنامه (اختیاری)</Label>
        <Input id="app" value={app} onChange={(e) => setApp(e.target.value)} dir="ltr"
          placeholder="مثلاً vlc یا org.videolan.vlc"
          className="h-11 bg-muted" />
      </div>
      <div>
        <Label htmlFor="type" className="font-bold mb-2">نوع مشکل</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="type" className="w-full bg-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="msg" className="font-bold mb-2">شرح مشکل</Label>
        <Textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
          placeholder="لطفاً دقیق بنویسید چه مشکلی دیدید..."
          className="bg-muted p-4 leading-7" />
      </div>
      {status === "error" && <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl p-3">دریافت اطلاعات با خطا مواجه شد. لطفاً دوباره تلاش کنید.</p>}
      <Button type="submit" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "در حال ارسال..." : "ثبت گزارش"}
      </Button>
    </form>
  );
}

export default function ReportPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold mb-2 text-center">گزارش مشکل</h1>
      <p className="text-sm text-muted-foreground mb-8 text-center">لینک خراب دیدید یا اطلاعات اشتباهی پیدا کردید؟ به ما بگید تا درستش کنیم.</p>
      <Suspense><Form /></Suspense>
    </div>
  );
}

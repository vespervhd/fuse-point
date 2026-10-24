"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

const COPY = {
  fa: {
    done: "گزارش شما ثبت شد، بررسی می‌کنیم",
    trigger: "گزارش مشکل",
    title: (n: string) => `مشکل «${n}» چیه؟`,
    desc: (n: string) => `فرم گزارش مشکل ${n}`,
    reasonLabel: "دلیل گزارش",
    pick: "انتخاب کن…",
    reasons: { "broken-link": "لینک دانلود خرابه", "wrong-info": "اطلاعات اشتباهه", malware: "مشکوک به بدافزار", other: "مورد دیگه" } as Record<string, string>,
    detailPh: "توضیح بیشتر (اختیاری)",
    sending: "در حال ارسال…",
    submit: "ثبت گزارش",
  },
  en: {
    done: "Report received — we'll look into it",
    trigger: "Report an issue",
    title: (n: string) => `What's wrong with “${n}”?`,
    desc: (n: string) => `Report form for ${n}`,
    reasonLabel: "Reason",
    pick: "Pick one…",
    reasons: { "broken-link": "Download link is broken", "wrong-info": "Wrong information", malware: "Suspected malware", other: "Something else" } as Record<string, string>,
    detailPh: "More detail (optional)",
    sending: "Sending…",
    submit: "Submit report",
  },
} as const;

export default function ReportButton({
  appId, appName, triggerClassName, triggerIcon, locale = "fa",
}: {
  appId: string; appName: string;
  triggerClassName?: string; triggerIcon?: React.ReactNode;
  locale?: Locale;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const c = COPY[locale];

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
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Flag className="w-4 h-4" /> {c.done}
      </p>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName}>
          {triggerIcon ?? <Flag className="w-4 h-4" />} {c.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">{c.title(appName)}</DialogTitle>
          <DialogDescription className="sr-only">{c.desc(appName)}</DialogDescription>
        </DialogHeader>
        <Select value={reason || undefined} onValueChange={setReason}>
          <SelectTrigger size="sm" className="w-full" aria-label={c.reasonLabel}>
            <SelectValue placeholder={c.pick} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(c.reasons).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder={c.detailPh}
          className="text-sm"
          rows={2}
        />
        <Button
          onClick={submit}
          disabled={!reason || sending}
          size="sm"
          className="justify-self-start"
        >
          {sending ? c.sending : c.submit}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

"use client";

// فرمِ گزارشِ مشکل — جدا از ReportButton تا کدِ Radix Dialog و Select فقط وقتی
// کاربر روی «گزارش مشکل» کلیک می‌کند بارگذاری شود، نه در باندلِ اولیه‌ی صفحه‌ی اپ.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
    title: (n: string) => `مشکل «${n}» چیه؟`,
    desc: (n: string) => `فرم گزارش مشکل ${n}`,
    reasonLabel: "دلیل گزارش",
    pick: "انتخاب کن…",
    reasons: { "broken-link": "لینک دانلود خرابه", "wrong-info": "اطلاعات اشتباهه", malware: "مشکوک به بدافزار", "bad-translation": "ترجمه اشتباهه", other: "مورد دیگه" } as Record<string, string>,
    detailPh: "توضیح بیشتر (اختیاری)",
    sending: "در حال ارسال…",
    submit: "ثبت گزارش",
  },
  en: {
    title: (n: string) => `What's wrong with “${n}”?`,
    desc: (n: string) => `Report form for ${n}`,
    reasonLabel: "Reason",
    pick: "Pick one…",
    reasons: { "broken-link": "Download link is broken", "wrong-info": "Wrong information", malware: "Suspected malware", "bad-translation": "Bad translation", other: "Something else" } as Record<string, string>,
    detailPh: "More detail (optional)",
    sending: "Sending…",
    submit: "Submit report",
  },
} as const;

export default function ReportDialog({ appId, appName, appSlug, locale, onClose, onDone }: {
  appId: string; appName: string; appSlug?: string; locale: Locale;
  onClose: () => void; onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [sending, setSending] = useState(false);
  const c = COPY[locale];

  // نگاشت دلیل دیالوگ به نوع گزارش API — پیش از این دیالوگ فیلدهای اشتباه
  // (appId/reason/detail) می‌فرستاد و API همیشه ۴۰۰ می‌داد؛ گزارش‌ها هرگز ثبت نمی‌شدند
  const TYPE_MAP: Record<string, string> = {
    "broken-link": "broken_link", "wrong-info": "wrong_info",
    malware: "malware_suspicion", "bad-translation": "bad_translation", other: "other",
  };
  const submit = async () => {
    if (!reason) return;
    setSending(true);
    try {
      const msg = detail.trim();
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appSlug: appSlug ?? appName,
          type: TYPE_MAP[reason] ?? "other",
          // API حداقل ۵ کاراکتر می‌خواهد؛ اگر کاربر توضیح نداد، خودِ برچسب دلیل پیام می‌شود
          message: msg.length >= 5 ? msg : (c.reasons[reason] ?? reason),
        }),
      });
      if (r.ok) onDone();
    } catch {}
    setSending(false);
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
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

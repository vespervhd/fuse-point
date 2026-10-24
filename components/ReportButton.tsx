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

export default function ReportButton({
  appId, appName, triggerClassName, triggerIcon,
}: {
  appId: string; appName: string;
  triggerClassName?: string; triggerIcon?: React.ReactNode;
}) {
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
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Flag className="w-4 h-4" /> گزارش شما ثبت شد، بررسی می‌کنیم
      </p>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName}>
          {triggerIcon ?? <Flag className="w-4 h-4" />} گزارش مشکل
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">مشکل «{appName}» چیه؟</DialogTitle>
          <DialogDescription className="sr-only">فرم گزارش مشکل {appName}</DialogDescription>
        </DialogHeader>
        <Select value={reason || undefined} onValueChange={setReason}>
          <SelectTrigger size="sm" className="w-full" aria-label="دلیل گزارش">
            <SelectValue placeholder="انتخاب کن…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="broken-link">لینک دانلود خرابه</SelectItem>
            <SelectItem value="wrong-info">اطلاعات اشتباهه</SelectItem>
            <SelectItem value="malware">مشکوک به بدافزار</SelectItem>
            <SelectItem value="other">مورد دیگه</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="توضیح بیشتر (اختیاری)"
          className="text-sm"
          rows={2}
        />
        <Button
          onClick={submit}
          disabled={!reason || sending}
          size="sm"
          className="justify-self-start"
        >
          {sending ? "در حال ارسال…" : "ثبت گزارش"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

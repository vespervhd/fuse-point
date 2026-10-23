"use client";
import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

// ثبت Service Worker
export function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

// دکمه‌ی نصب اپ (PWA)
const PWA_KEY = "vesper-pwa-seen";

export function InstallButton() {
  const [deferred, setDeferred] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(PWA_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {}
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const markSeen = () => {
    try { localStorage.setItem(PWA_KEY, "1"); } catch {}
    setDismissed(true);
  };

  if (!deferred || dismissed) return null;

  const install = async () => {
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    markSeen();
  };

  return (
    <div className="toast toast-bottom toast-center z-50 mb-20" role="dialog" aria-label="نصب Fuse Point">
      <div className="alert shadow-lg gap-3">
        <img src="/icons/icon-192.png" alt="لوگوی Fuse Point" width={40} height={40} className="w-10 h-10 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Fuse Point را نصب کنید</p>
          <p className="text-xs opacity-70">دسترسی سریع‌تر، مثل یک اپ واقعی</p>
        </div>
        <button onClick={install} className="btn btn-primary btn-sm shrink-0 gap-1">
          <Download className="w-4 h-4" aria-hidden="true" /> نصب
        </button>
        <button onClick={markSeen} aria-label="بستن"
          className="btn btn-ghost btn-circle btn-sm shrink-0">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

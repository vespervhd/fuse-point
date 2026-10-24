"use client";

import { useRef, useState } from "react";
import {
  Activity, AlarmClock, Bell, Bluetooth, Calendar, Camera, Download, Eye, Fingerprint,
  Flashlight, Globe, HardDrive, Image, KeyRound, Layers, MapPin, Mic, Nfc, Phone,
  Power, Settings, ShieldCheck, TriangleAlert, Users, Vibrate, Wifi, Zap,
  type LucideIcon,
} from "lucide-react";
import ReportButton from "@/components/ReportButton";

// ─── آیکون‌های خطی عین طرح مرجع ───
const ShieldGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3 19 6.5v5.2c0 4.1-2.8 7.3-7 9.3-4.2-2-7-5.2-7-9.3V6.5L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ChevronGlyph = () => (
  <svg className="dt-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CopyGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="8" y="8" width="12" height="13" rx="2" />
    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" />
  </svg>
);

// ─── عنوان و توضیح ساده‌ی مجوزها (لایه‌ی نمایش؛ مقدار واقعی از دیتابیس می‌آید) ───
type PermMeta = { title: string; desc: string; Icon: LucideIcon };

const PERM_META: Record<string, PermMeta> = {
  "android.permission.INTERNET": { title: "شبکه", desc: "دسترسی کامل به اینترنت", Icon: Globe },
  "android.permission.ACCESS_NETWORK_STATE": { title: "وضعیت شبکه", desc: "مشاهده‌ی وضعیت اتصال شبکه", Icon: Wifi },
  "android.permission.ACCESS_WIFI_STATE": { title: "وای‌فای", desc: "مشاهده‌ی وضعیت وای‌فای", Icon: Wifi },
  "android.permission.CHANGE_WIFI_STATE": { title: "وای‌فای", desc: "تغییر وضعیت وای‌فای", Icon: Wifi },
  "android.permission.READ_EXTERNAL_STORAGE": { title: "حافظه", desc: "خواندن فایل‌های مشترک گوشی", Icon: HardDrive },
  "android.permission.WRITE_EXTERNAL_STORAGE": { title: "حافظه", desc: "خواندن و نوشتن فایل‌های مشترک گوشی", Icon: HardDrive },
  "android.permission.MANAGE_EXTERNAL_STORAGE": { title: "حافظه", desc: "مدیریت همه‌ی فایل‌های گوشی", Icon: HardDrive },
  "android.permission.READ_MEDIA_IMAGES": { title: "عکس‌ها", desc: "دسترسی به عکس‌های گوشی", Icon: Image },
  "android.permission.READ_MEDIA_VIDEO": { title: "ویدیوها", desc: "دسترسی به ویدیوهای گوشی", Icon: Image },
  "android.permission.READ_MEDIA_AUDIO": { title: "فایل‌های صوتی", desc: "دسترسی به فایل‌های صوتی گوشی", Icon: Image },
  "android.permission.WAKE_LOCK": { title: "بیدار نگه‌داشتن", desc: "جلوگیری از خواب گوشی هنگام اجرای کارهای طولانی", Icon: Zap },
  "android.permission.FOREGROUND_SERVICE": { title: "اجرای پس‌زمینه", desc: "اجرای سرویس در پیش‌زمینه با اعلان دائمی", Icon: Layers },
  "android.permission.POST_NOTIFICATIONS": { title: "اعلان‌ها", desc: "نمایش اعلان روی گوشی", Icon: Bell },
  "android.permission.CAMERA": { title: "دوربین", desc: "دسترسی به دوربین گوشی", Icon: Camera },
  "android.permission.RECORD_AUDIO": { title: "میکروفون", desc: "ضبط صدا با میکروفون", Icon: Mic },
  "android.permission.ACCESS_FINE_LOCATION": { title: "مکان دقیق", desc: "دسترسی به موقعیت مکانی دقیق", Icon: MapPin },
  "android.permission.ACCESS_COARSE_LOCATION": { title: "مکان تقریبی", desc: "دسترسی به موقعیت مکانی تقریبی", Icon: MapPin },
  "android.permission.READ_CONTACTS": { title: "مخاطبین", desc: "خواندن فهرست مخاطبین", Icon: Users },
  "android.permission.WRITE_CONTACTS": { title: "مخاطبین", desc: "تغییر فهرست مخاطبین", Icon: Users },
  "android.permission.CALL_PHONE": { title: "تماس", desc: "برقراری تماس تلفنی", Icon: Phone },
  "android.permission.READ_PHONE_STATE": { title: "وضعیت تلفن", desc: "مشاهده‌ی وضعیت و هویت تلفن", Icon: Phone },
  "android.permission.RECEIVE_BOOT_COMPLETED": { title: "اجرای خودکار", desc: "اجرا شدن بعد از روشن شدن گوشی", Icon: Power },
  "android.permission.VIBRATE": { title: "لرزش", desc: "کنترل لرزش گوشی", Icon: Vibrate },
  "android.permission.USE_BIOMETRIC": { title: "زیست‌سنجی", desc: "استفاده از اثرانگشت یا چهره برای ورود", Icon: Fingerprint },
  "android.permission.USE_FINGERPRINT": { title: "اثرانگشت", desc: "استفاده از اثرانگشت برای ورود", Icon: Fingerprint },
  "android.permission.REQUEST_INSTALL_PACKAGES": { title: "نصب برنامه", desc: "درخواست نصب بسته‌های دیگر", Icon: Download },
  "android.permission.DOWNLOAD_WITHOUT_NOTIFICATION": { title: "دانلود پس‌زمینه", desc: "دانلود فایل بدون نمایش اعلان", Icon: Download },
  "android.permission.SCHEDULE_EXACT_ALARM": { title: "زمان‌بندی دقیق", desc: "تنظیم هشدار در زمان دقیق", Icon: AlarmClock },
  "android.permission.SET_ALARM": { title: "هشدار", desc: "تنظیم ساعت هشدار", Icon: AlarmClock },
  "android.permission.BLUETOOTH": { title: "بلوتوث", desc: "اتصال به دستگاه‌های بلوتوثی", Icon: Bluetooth },
  "android.permission.BLUETOOTH_CONNECT": { title: "بلوتوث", desc: "اتصال به دستگاه‌های بلوتوثی", Icon: Bluetooth },
  "android.permission.BLUETOOTH_SCAN": { title: "بلوتوث", desc: "جستجوی دستگاه‌های بلوتوثی اطراف", Icon: Bluetooth },
  "android.permission.NFC": { title: "NFC", desc: "ارتباط نزدیک با برچسب‌ها و دستگاه‌های NFC", Icon: Nfc },
  "android.permission.BODY_SENSORS": { title: "حسگرها", desc: "دسترسی به حسگرهای بدنی گوشی", Icon: Activity },
  "android.permission.FLASHLIGHT": { title: "چراغ‌قوه", desc: "استفاده از چراغ‌قوه‌ی گوشی", Icon: Flashlight },
  "android.permission.SYSTEM_ALERT_WINDOW": { title: "نمایش روی برنامه‌ها", desc: "نمایش پنجره روی برنامه‌های دیگر", Icon: Layers },
  "android.permission.WRITE_SETTINGS": { title: "تنظیمات", desc: "تغییر تنظیمات سیستم", Icon: Settings },
  "android.permission.SET_WALLPAPER": { title: "پس‌زمینه", desc: "تغییر تصویر پس‌زمینه‌ی گوشی", Icon: Image },
  "android.permission.READ_CALENDAR": { title: "تقویم", desc: "خواندن رویدادهای تقویم", Icon: Calendar },
  "android.permission.WRITE_CALENDAR": { title: "تقویم", desc: "تغییر رویدادهای تقویم", Icon: Calendar },
  "android.permission.ACCESS_MEDIA_LOCATION": { title: "مکان عکس‌ها", desc: "خواندن مکان ثبت‌شده در عکس‌ها", Icon: Eye },
};

function permMeta(permission: string): PermMeta & { raw: boolean } {
  const hit = PERM_META[permission];
  if (hit) return { ...hit, raw: false };
  const last = permission.split(".").pop() ?? permission;
  const pretty = last.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
  return { title: pretty, desc: permission, Icon: KeyRound, raw: true };
}

type Props = {
  developer: string;
  license: string | null;
  updatedLabel: string;
  sourceHref: string | null;
  sourceLabel: string;
  minAndroidLabel: string | null;
  verifiedLabel: string | null;
  sha256: string | null;
  permissions: string[];
  appId: string;
  appName: string;
};

// کشوی «مشخصات کامل» — عین طرح تأییدشده؛ همه‌ی مقادیر واقعی از دیتابیس
export default function AppDetailsDrawer({
  developer, license, updatedLabel, sourceHref, sourceLabel,
  minAndroidLabel, verifiedLabel, sha256, permissions, appId, appName,
}: Props) {
  const [copyStatus, setCopyStatus] = useState("");
  const hashRef = useRef<HTMLElement>(null);

  const copyHash = async () => {
    if (!sha256) return;
    try {
      await navigator.clipboard.writeText(sha256);
      setCopyStatus("هش کپی شد.");
    } catch {
      const node = hashRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setCopyStatus("هش انتخاب شد؛ آن را کپی کنید.");
    }
  };

  return (
    <details className="dt-details">
      <summary>
        <span className="dt-summary-icon" aria-hidden="true"><ShieldGlyph /></span>
        <span className="dt-summary-copy">
          <span className="dt-summary-title">مشخصات کامل</span>
          <span className="dt-summary-caption">اطلاعات برنامه، هش امنیتی و مجوزهای دسترسی</span>
        </span>
        <ChevronGlyph />
      </summary>

      <div className="dt-content">
        <p className="dt-section-label">اطلاعات برنامه</p>
        <dl className="dt-info-list">
          <div className="dt-info-row">
            <dt>توسعه‌دهنده</dt>
            <dd>{developer}</dd>
          </div>
          <div className="dt-info-row">
            <dt>مجوز</dt>
            {license
              ? <dd dir="ltr" className="dt-ltr">{license}</dd>
              : <dd>—</dd>}
          </div>
          <div className="dt-info-row">
            <dt>آخرین به‌روزرسانی</dt>
            <dd>{updatedLabel}</dd>
          </div>
          <div className="dt-info-row">
            <dt>منبع رسمی</dt>
            <dd>
              {sourceHref ? (
                <a href={sourceHref} target="_blank" rel="noopener noreferrer" dir="ltr" className="dt-ltr" style={{ display: "inline-block" }}>
                  {sourceLabel}
                </a>
              ) : sourceLabel}
            </dd>
          </div>
          {minAndroidLabel && (
            <div className="dt-info-row">
              <dt>حداقل اندروید</dt>
              <dd>{minAndroidLabel}</dd>
            </div>
          )}
          <div className="dt-info-row">
            <dt>وضعیت بررسی</dt>
            <dd>
              {verifiedLabel ? (
                <span className="inline-flex items-center gap-1.5 text-success font-bold">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" /> بررسی‌شده · {verifiedLabel}
                </span>
              ) : (
                <span className="text-muted-foreground">در انتظار بررسی</span>
              )}
            </dd>
          </div>
        </dl>

        {sha256 && (
          <>
            <p className="dt-section-label">هش امنیتی · SHA-256</p>
            <div className="dt-hash-box">
              <code className="dt-hash-value" ref={hashRef}>{sha256}</code>
              <button type="button" className="dt-copy" onClick={copyHash} aria-label="کپی هش SHA-256" title="کپی هش">
                <CopyGlyph />
              </button>
            </div>
            <p className="dt-copy-status" aria-live="polite">{copyStatus}</p>
          </>
        )}

        {permissions.length > 0 && (
          <>
            <p className="dt-section-label">مجوزهای دسترسی</p>
            <div>
              {permissions.map((p) => {
                const m = permMeta(p);
                return (
                  <div key={p} className="dt-perm">
                    <span className="dt-perm-icon" aria-hidden="true">
                      <m.Icon strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="dt-perm-title">{m.title}</p>
                      {m.raw
                        ? <p className="dt-perm-desc dt-perm-raw">{m.desc}</p>
                        : <p className="dt-perm-desc">{m.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <ReportButton
          appId={appId}
          appName={appName}
          triggerClassName="dt-report"
          triggerIcon={<TriangleAlert aria-hidden="true" />}
        />
      </div>
    </details>
  );
}

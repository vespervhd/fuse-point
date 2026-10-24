"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Activity, AlarmClock, Bell, Bluetooth, Calendar, Camera, ChevronLeft, Download, Eye, Fingerprint,
  Flashlight, Globe, HardDrive, Image, KeyRound, Layers, MapPin, Mic, Nfc, Phone,
  Power, Settings, ShieldCheck, TriangleAlert, Users, Vibrate, Wifi, Zap,
  type LucideIcon,
} from "lucide-react";
import ReportButton from "@/components/ReportButton";
import { STR, type Locale } from "@/lib/i18n";

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

// عنوان/توضیح انگلیسی مجوزهای شناخته‌شده (همان کلیدهای PERM_META)
const PERM_EN: Record<string, { title: string; desc: string }> = {
  "android.permission.INTERNET": { title: "Network", desc: "Full internet access" },
  "android.permission.ACCESS_NETWORK_STATE": { title: "Network state", desc: "View network connection status" },
  "android.permission.ACCESS_WIFI_STATE": { title: "Wi-Fi", desc: "View Wi-Fi status" },
  "android.permission.CHANGE_WIFI_STATE": { title: "Wi-Fi", desc: "Change Wi-Fi state" },
  "android.permission.READ_EXTERNAL_STORAGE": { title: "Storage", desc: "Read shared files on the device" },
  "android.permission.WRITE_EXTERNAL_STORAGE": { title: "Storage", desc: "Read and write shared files on the device" },
  "android.permission.MANAGE_EXTERNAL_STORAGE": { title: "Storage", desc: "Manage all files on the device" },
  "android.permission.READ_MEDIA_IMAGES": { title: "Photos", desc: "Access photos on the device" },
  "android.permission.READ_MEDIA_VIDEO": { title: "Videos", desc: "Access videos on the device" },
  "android.permission.READ_MEDIA_AUDIO": { title: "Audio files", desc: "Access audio files on the device" },
  "android.permission.WAKE_LOCK": { title: "Stay awake", desc: "Keeps the device awake during long tasks" },
  "android.permission.FOREGROUND_SERVICE": { title: "Background run", desc: "Runs a foreground service with a persistent notification" },
  "android.permission.POST_NOTIFICATIONS": { title: "Notifications", desc: "Show notifications on the device" },
  "android.permission.CAMERA": { title: "Camera", desc: "Access the device camera" },
  "android.permission.RECORD_AUDIO": { title: "Microphone", desc: "Record audio with the microphone" },
  "android.permission.ACCESS_FINE_LOCATION": { title: "Precise location", desc: "Access precise device location" },
  "android.permission.ACCESS_COARSE_LOCATION": { title: "Approximate location", desc: "Access approximate device location" },
  "android.permission.READ_CONTACTS": { title: "Contacts", desc: "Read the contacts list" },
  "android.permission.WRITE_CONTACTS": { title: "Contacts", desc: "Modify the contacts list" },
  "android.permission.CALL_PHONE": { title: "Calls", desc: "Place phone calls" },
  "android.permission.READ_PHONE_STATE": { title: "Phone state", desc: "View phone state and identity" },
  "android.permission.RECEIVE_BOOT_COMPLETED": { title: "Auto-start", desc: "Runs after the device boots" },
  "android.permission.VIBRATE": { title: "Vibration", desc: "Control device vibration" },
  "android.permission.USE_BIOMETRIC": { title: "Biometrics", desc: "Use fingerprint or face to sign in" },
  "android.permission.USE_FINGERPRINT": { title: "Fingerprint", desc: "Use fingerprint to sign in" },
  "android.permission.REQUEST_INSTALL_PACKAGES": { title: "Install apps", desc: "Request installing other packages" },
  "android.permission.DOWNLOAD_WITHOUT_NOTIFICATION": { title: "Background download", desc: "Download files without a notification" },
  "android.permission.SCHEDULE_EXACT_ALARM": { title: "Exact scheduling", desc: "Set alarms at an exact time" },
  "android.permission.SET_ALARM": { title: "Alarms", desc: "Set alarm clocks" },
  "android.permission.BLUETOOTH": { title: "Bluetooth", desc: "Connect to Bluetooth devices" },
  "android.permission.BLUETOOTH_CONNECT": { title: "Bluetooth", desc: "Connect to Bluetooth devices" },
  "android.permission.BLUETOOTH_SCAN": { title: "Bluetooth", desc: "Scan for nearby Bluetooth devices" },
  "android.permission.NFC": { title: "NFC", desc: "Communicate with NFC tags and devices" },
  "android.permission.BODY_SENSORS": { title: "Sensors", desc: "Access body sensors" },
  "android.permission.FLASHLIGHT": { title: "Flashlight", desc: "Use the device flashlight" },
  "android.permission.SYSTEM_ALERT_WINDOW": { title: "Display over apps", desc: "Show windows over other apps" },
  "android.permission.WRITE_SETTINGS": { title: "Settings", desc: "Change system settings" },
  "android.permission.SET_WALLPAPER": { title: "Wallpaper", desc: "Change the device wallpaper" },
  "android.permission.READ_CALENDAR": { title: "Calendar", desc: "Read calendar events" },
  "android.permission.WRITE_CALENDAR": { title: "Calendar", desc: "Modify calendar events" },
  "android.permission.ACCESS_MEDIA_LOCATION": { title: "Photo locations", desc: "Read locations stored in photos" },
};

// ─── سطح ریسک مجوزها (نگاشت دستی و محافظه‌کارانه؛ خودِ مجوز از دیتابیس می‌آید) ───
// low: دسترسی‌های سطح normal اندروید و کم‌اثر. mid: دسترسی‌های runtime ولی محدود به
// یک داده‌ی مشخص (دوربین، میکروفون، مکان، مخاطبین، حافظه). high: دسترسی گسترده یا سیستمی.
// قانون پیش‌فرض برای مجوزهای ناشناخته: فقط نام‌های شناخته‌شده‌ی سطح normal اندروید
// (NORMAL_LEVEL_EXTRA) low می‌گیرند؛ بقیه‌ی ناشناخته‌ها mid — چون ممکن است runtime
// باشند و حدس «کم‌ریسک» برای یک نام ناشناخته گمراه‌کننده است.
type RiskLevel = "low" | "mid" | "high";

const PERM_RISK: Record<string, RiskLevel> = {
  // low — normal و کم‌اثر
  "android.permission.INTERNET": "low",
  "android.permission.ACCESS_NETWORK_STATE": "low",
  "android.permission.ACCESS_WIFI_STATE": "low",
  "android.permission.CHANGE_WIFI_STATE": "low",
  "android.permission.VIBRATE": "low",
  "android.permission.WAKE_LOCK": "low",
  "android.permission.FOREGROUND_SERVICE": "low",
  "android.permission.POST_NOTIFICATIONS": "low",
  "android.permission.RECEIVE_BOOT_COMPLETED": "low",
  "android.permission.SET_ALARM": "low",
  "android.permission.SCHEDULE_EXACT_ALARM": "low",
  "android.permission.FLASHLIGHT": "low",
  "android.permission.NFC": "low",
  "android.permission.BLUETOOTH": "low",
  "android.permission.USE_BIOMETRIC": "low",
  "android.permission.USE_FINGERPRINT": "low",
  "android.permission.SET_WALLPAPER": "low",
  "android.permission.DOWNLOAD_WITHOUT_NOTIFICATION": "low",
  // mid — runtime ولی محدود به یک داده‌ی مشخص
  "android.permission.READ_EXTERNAL_STORAGE": "mid",
  "android.permission.WRITE_EXTERNAL_STORAGE": "mid",
  "android.permission.READ_MEDIA_IMAGES": "mid",
  "android.permission.READ_MEDIA_VIDEO": "mid",
  "android.permission.READ_MEDIA_AUDIO": "mid",
  "android.permission.REQUEST_INSTALL_PACKAGES": "mid",
  "android.permission.CAMERA": "mid",
  "android.permission.RECORD_AUDIO": "mid",
  "android.permission.ACCESS_FINE_LOCATION": "mid",
  "android.permission.ACCESS_COARSE_LOCATION": "mid",
  "android.permission.ACCESS_MEDIA_LOCATION": "mid",
  "android.permission.READ_CONTACTS": "mid",
  "android.permission.WRITE_CONTACTS": "mid",
  "android.permission.CALL_PHONE": "mid",
  "android.permission.READ_PHONE_STATE": "mid",
  "android.permission.BODY_SENSORS": "mid",
  "android.permission.READ_CALENDAR": "mid",
  "android.permission.WRITE_CALENDAR": "mid",
  "android.permission.BLUETOOTH_CONNECT": "mid",
  "android.permission.BLUETOOTH_SCAN": "mid",
  // high — گسترده یا سیستمی
  "android.permission.MANAGE_EXTERNAL_STORAGE": "high",
  "android.permission.SYSTEM_ALERT_WINDOW": "high",
  "android.permission.WRITE_SECURE_SETTINGS": "high",
  "android.permission.WRITE_SETTINGS": "high",
  "android.permission.READ_LOGS": "high",
  "android.permission.DUMP": "high",
  "android.permission.PACKAGE_USAGE_STATS": "high",
};

// مجوزهای سطح normal اندروید که در PERM_META نیستند ولی کم‌ریسک‌اند
const NORMAL_LEVEL_EXTRA = new Set([
  "android.permission.TRANSMIT_IR",
  "android.permission.SET_WALLPAPER_HINTS",
  "android.permission.KILL_BACKGROUND_PROCESSES",
]);

function permRisk(permission: string): RiskLevel {
  return PERM_RISK[permission] ?? (NORMAL_LEVEL_EXTRA.has(permission) ? "low" : "mid");
}

const RISK_KEY = { low: "riskLow", mid: "riskMid", high: "riskHigh" } as const;

function permMeta(permission: string, locale: Locale): PermMeta & { raw: boolean } {
  const hit = PERM_META[permission];
  if (hit) {
    if (locale === "en" && PERM_EN[permission]) {
      return { title: PERM_EN[permission].title, desc: PERM_EN[permission].desc, Icon: hit.Icon, raw: false };
    }
    return { ...hit, raw: false };
  }
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
  developerHref?: string | null;
  locale?: Locale;
};

// کشوی «مشخصات کامل» — عین طرح تأییدشده؛ همه‌ی مقادیر واقعی از دیتابیس
export default function AppDetailsDrawer({
  developer, license, updatedLabel, sourceHref, sourceLabel,
  minAndroidLabel, verifiedLabel, sha256, permissions, appId, appName,
  developerHref, locale = "fa",
}: Props) {
  const [copyStatus, setCopyStatus] = useState("");
  const hashRef = useRef<HTMLElement>(null);
  const d = STR[locale];

  const copyHash = async () => {
    if (!sha256) return;
    try {
      await navigator.clipboard.writeText(sha256);
      setCopyStatus(d.copied);
    } catch {
      const node = hashRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setCopyStatus(d.copyFallback);
    }
  };

  return (
    <details className="dt-details">
      <summary>
        <span className="dt-summary-icon" aria-hidden="true"><ShieldGlyph /></span>
        <span className="dt-summary-copy">
          <span className="dt-summary-title">{d.fullDetails}</span>
          <span className="dt-summary-caption">{d.fullDetailsCap}</span>
        </span>
        <ChevronGlyph />
      </summary>

      <div className="dt-content">
        <p className="dt-section-label">{d.appInfo}</p>
        <dl className="dt-info-list">
          <div className="dt-info-row">
            <dt>{d.developer}</dt>
            <dd>
              {developerHref ? (
                <Link href={developerHref} className="dev-link">
                  {developer}
                  <span className="flip-x inline-grid place-items-center" aria-hidden="true">
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  </span>
                </Link>
              ) : developer}
            </dd>
          </div>
          <div className="dt-info-row">
            <dt>{d.license}</dt>
            {license
              ? <dd dir="ltr" className="dt-ltr">{license}</dd>
              : <dd>—</dd>}
          </div>
          <div className="dt-info-row">
            <dt>{d.updated}</dt>
            <dd>{updatedLabel}</dd>
          </div>
          <div className="dt-info-row">
            <dt>{d.source}</dt>
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
              <dt>{d.minAndroid}</dt>
              <dd>{minAndroidLabel}</dd>
            </div>
          )}
          <div className="dt-info-row">
            <dt>{d.verifyStatus}</dt>
            <dd>
              {verifiedLabel ? (
                <span className="inline-flex items-center gap-1.5 text-success font-bold">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" /> {locale === "fa" ? "بررسی‌شده" : "Verified"} · {verifiedLabel}
                </span>
              ) : (
                <span className="text-muted-foreground">{d.pendingReview}</span>
              )}
            </dd>
          </div>
        </dl>

        {sha256 && (
          <>
            <p className="dt-section-label">{d.hashLabel}</p>
            <div className="dt-hash-box">
              <code className="dt-hash-value" ref={hashRef}>{sha256}</code>
              <button type="button" className="dt-copy" onClick={copyHash} aria-label={d.copyHash} title={d.copyHash}>
                <CopyGlyph />
              </button>
            </div>
            <p className="dt-copy-status" aria-live="polite">{copyStatus}</p>
          </>
        )}

        {permissions.length > 0 && (
          <>
            <p className="dt-section-label">{d.perms}</p>
            <p className="dt-perm-note">{d.permRiskNote}</p>
            <div>
              {permissions.map((p) => {
                const m = permMeta(p, locale);
                const risk = permRisk(p);
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
                    <span className={`dt-risk dt-risk-${risk}`}>{d[RISK_KEY[risk]]}</span>
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
          locale={locale}
        />
      </div>
    </details>
  );
}

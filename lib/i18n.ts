// دوزبانگی فیوز پوینت — فرهنگ رشته‌های رابط + ابزارهای وابسته به زبان
// زبان از کوکی fp-lang خوانده می‌شود (پیش‌فرض: فارسی/راست‌به‌چپ)
// این فایل خالص است (سمت کاربر هم قابل استفاده)؛ خواندن کوکی در lib/i18n-server.ts است
import { toFaDigits, formatBytes, formatDate } from "./fa";

export type Locale = "fa" | "en";
export const LANG_COOKIE = "fp-lang";

export const isRtl = (l: Locale) => l === "fa";
export const dirOf = (l: Locale) => (l === "fa" ? "rtl" : "ltr") as "rtl" | "ltr";

const fa = {
  searchPh: "جستجو در فروشگاه…",
  advPh: "نام برنامه…",
  cats: "دسته‌بندی‌ها",
  cols: "مجموعه‌ها",
  colsTitle: "مجموعه‌های ویژه",
  seeAll: "مشاهده همه",
  allApps: "همه‌ی برنامه‌ها",
  featured: "برگزیده",
  plat_android: "اندروید",
  plat_windows: "ویندوز",
  plat_linux: "لینوکس",
  backStore: "بازگشت به فروشگاه",
  backCats: "بازگشت به دسته‌بندی‌ها",
  backCols: "بازگشت به مجموعه‌ها",
  backApp: "بازگشت به برنامه",
  ready: "آماده دانلود",
  fileInfo: "اطلاعات فایل",
  platform: "پلتفرم",
  fileSize: "حجم فایل",
  download: "دانلود برنامه",
  footnote: "فایل را فقط از منبع معتبر دریافت کنید",
  preview: "پیش‌نمایش",
  about: "درباره‌ی این برنامه",
  similar: "برنامه‌های مشابه",
  fullDetails: "مشخصات کامل",
  fullDetailsCap: "اطلاعات برنامه، هش امنیتی و مجوزهای دسترسی",
  appInfo: "اطلاعات برنامه",
  developer: "توسعه‌دهنده",
  license: "مجوز",
  updated: "آخرین به‌روزرسانی",
  source: "منبع رسمی",
  hashLabel: "هش امنیتی · SHA-256",
  perms: "مجوزهای دسترسی",
  report: "گزارش مشکل",
  copyHash: "کپی هش",
  copied: "هش کپی شد.",
  copyFallback: "هش انتخاب شد؛ آن را کپی کنید.",
  favs: "علاقه‌مندی‌ها",
  favToggle: "افزودن به علاقه‌مندی‌ها",
  favAdded: "به علاقه‌مندی‌ها اضافه شد.",
  favRemoved: "از علاقه‌مندی‌ها حذف شد.",
  advSearch: "جستجوی پیشرفته",
  advSearchSub: "فقط داخل همین پلتفرم می‌گرده.",
  emptySearch: "اپی با این ترکیب پیدا نشد.",
  sortBy: "مرتب‌سازی:",
  sortNew: "جدیدترین",
  sortLight: "سبک‌ترین",
  sortAlpha: "الفبا",
  sortPopular: "محبوب‌ترین",
  sortUpdated: "به‌روزترین",
  clearFilters: "حذف فیلترها",
  results: "نتایج",
  noApp: "برنامه‌ای پیدا نشد",
  noAppHint: "املای عبارت را بررسی کنید یا فیلترها را کمتر کنید.",
  allCats: "همه",
  catsSub: "دسته‌ها بر اساس برنامه‌های همین پلتفرم شمرده می‌شن.",
  colsSub: "چینش‌های دست‌چین‌شده برای کارهای مختلف",
  favsSub: "برنامه‌هایی که نشان کردی، روی همین پلتفرم.",
  favsEmpty: "هنوز برنامه‌ای رو نشان نکردی",
  favsEmptySub: "روی هر ردیف یا صفحه‌ی برنامه، «نشان» رو بزن.",
  favsEmptyHint: "روی «نشان» هر برنامه بزن تا اینجا ذخیره شود.",
  listEmptyCat: "توی این دسته روی این پلتفرم برنامه‌ای نیست.",
  whyTitle: "چرا فیوز پوینت؟",
  whySub: "اعتماد و امنیت، اولویت اول فیوز پوینته — این‌ها قول‌های ما نیستن، روش کارمونه:",
  footDesc: "فروشگاه اپ‌های آزاد برای اندروید، ویندوز و لینوکس.",
  footStatus: "آرشیو در حال توسعه",
  footStatusSub: "کیفیت و اعتبار منابع، اولویت ماست.",
  notifications: "اعلان‌ها",
  notifSub: "نسخه‌های تازه‌ی اپ‌هایی که دنبال می‌کنی، اینجا میاد",
  notifNew: "نسخه‌ی تازه‌ی {n} منتشر شد",
  notifsEmpty: "اعلانی نداری",
  notifsEmptySub: "از صفحه‌ی هر برنامه «دنبال کردن» رو بزن تا نسخه‌ی تازه‌ش رو اینجا ببینی.",
  markAllRead: "همه را خوانده‌شده کن",
  markRead: "خوانده شد",
  viewApp: "مشاهده برنامه",
  loading: "در حال بارگذاری…",
  versions: "نسخه‌های قبلی",
  versionsCap: "دانلود نسخه‌های قدیمی‌تر و تغییرات هر نسخه",
  verSource: "منبع نسخه‌ها",
  fresh: "تازه‌ها",
  freshSub: "اپ‌های تازه و تازه به‌روزشده، روی همین پلتفرم",
  freshNew: "جدیدترین‌ها",
  freshUpd: "آخرین به‌روزرسانی‌ها",
  follow: "دنبال کردن",
  following: "در حال پیگیری",
  save: "نشان",
  followNote: "نسخه‌ی جدید که بیاد، خبرت می‌کنیم.",
  devEmpty: "روی این پلتفرم برنامه‌ای از این توسعه‌دهنده نیست.",
  devApps: "برنامه‌های این توسعه‌دهنده",
  reqApp: "درخواست اپ",
  reqSub: "اپ آزادی که جاش توی فروشگاه خالیه رو بگو؛ بررسیش می‌کنیم.",
  reqName: "نام برنامه",
  reqLink: "لینک منبع رسمی (اختیاری)",
  reqDesc: "توضیح کوتاه (اختیاری)",
  reqSubmit: "ثبت درخواست",
  reqDone: "درخواستت ثبت شد؛ بعد از بررسی به فروشگاه اضافه می‌شه.",
  reqMine: "درخواست‌های من",
  reqNone: "هنوز درخواستی ثبت نکردی.",
  reqNameErr: "نام برنامه رو بنویس.",
  reqLoginTitle: "برای ثبت درخواست وارد شو",
  reqLoginSub: "درخواست اپ به حسابت وصل می‌شه تا وضعیتش رو ببینی.",
  login: "ورود",
  signup: "ثبت‌نام",
  logout: "خروج",
  email: "ایمیل",
  password: "رمز عبور",
  name: "نام",
  loginTitle: "ورود به حساب",
  signupTitle: "ساخت حساب",
  noAccount: "حساب نداری؟",
  haveAccount: "حساب داری؟",
  home: "خانه",
  themeChange: "تغییر تم",
  themeIs: "تم فعلی",
  headerSearch: "جستجو",
  langSwitch: "Switch to English",
  appsWord: "برنامه",
  searchResultsFor: "نتایج جست‌وجو برای",
  resultWord: "نتیجه",
  emptyHome: "اپی با این ترکیب پیدا نشد.",
  tryAnotherPlatform: "یه پلتفرم دیگه رو امتحان کن.",
  moreApps: "برنامه‌های بیشتر در جستجوی پیشرفته",
  backHome: "بازگشت به خانه",
  backToCats: "بازگشت به دسته‌بندی‌ها",
  emptyCat: "برنامه‌ای در این دسته نیست.",
  minAndroid: "حداقل اندروید",
  verifyStatus: "وضعیت بررسی",
  verified: "بررسی‌شده",
  pendingReview: "در انتظار بررسی",
  unknown: "نامشخص",
  updateAvailable: "نسخه‌ی جدید موجوده!",
  updateFromTo: "از {from} به {to}",
  updateReleased: "نسخه‌ی {v} منتشر شده",
  alternatives: "جایگزین‌های آزاد",
  category: "دسته‌بندی",
  terms: "قوانین",
  privacy: "حریم خصوصی",
  aboutUs: "درباره‌ی ما",
  reqStatus_pending: "در حال بررسی",
  reqStatus_added: "اضافه شد",
  reqStatus_rejected: "رد شد",
  sizeWord: "حجم",
  versionWord: "نسخه",
};

export type Dict = typeof fa;

const en: Dict = {
  searchPh: "Search apps…",
  advPh: "App name…",
  cats: "Categories",
  cols: "Collections",
  colsTitle: "Featured collections",
  seeAll: "See all",
  allApps: "All apps",
  featured: "Featured",
  plat_android: "Android",
  plat_windows: "Windows",
  plat_linux: "Linux",
  backStore: "Back to store",
  backCats: "Back to categories",
  backCols: "Back to collections",
  backApp: "Back to app",
  ready: "Ready to download",
  fileInfo: "File info",
  platform: "Platform",
  fileSize: "File size",
  download: "Download",
  footnote: "Only get files from a trusted source",
  preview: "Preview",
  about: "About this app",
  similar: "Similar apps",
  fullDetails: "Full details",
  fullDetailsCap: "App info, security hash and permissions",
  appInfo: "App info",
  developer: "Developer",
  license: "License",
  updated: "Last updated",
  source: "Official source",
  hashLabel: "Security hash · SHA-256",
  perms: "Permissions",
  report: "Report an issue",
  copyHash: "Copy hash",
  copied: "Hash copied.",
  copyFallback: "Hash selected — copy it now.",
  favs: "Favorites",
  favToggle: "Add to favorites",
  favAdded: "Added to favorites.",
  favRemoved: "Removed from favorites.",
  advSearch: "Advanced search",
  advSearchSub: "Searches only within this platform.",
  emptySearch: "No app matches this combination.",
  sortBy: "Sort by:",
  sortNew: "Newest",
  sortLight: "Lightest",
  sortAlpha: "A–Z",
  sortPopular: "Most popular",
  sortUpdated: "Recently updated",
  clearFilters: "Clear filters",
  results: "Results",
  noApp: "No app found",
  noAppHint: "Check the spelling or loosen the filters.",
  allCats: "All",
  catsSub: "Category counts are based on apps on this platform.",
  colsSub: "Hand-picked sets for different jobs",
  favsSub: "Apps you bookmarked, on this platform.",
  favsEmpty: "You haven't bookmarked any app yet",
  favsEmptySub: "Tap “Bookmark” on any row or app page.",
  favsEmptyHint: "Tap “Save” on any app to keep it here.",
  listEmptyCat: "No apps in this category on this platform.",
  whyTitle: "Why Fuse Point?",
  whySub: "Trust and security come first at Fuse Point — these aren't promises, they're how it works:",
  footDesc: "A free & open-source app store for Android, Windows and Linux.",
  footStatus: "Archive growing",
  footStatusSub: "Source quality and trustworthiness are our priority.",
  notifications: "Notifications",
  notifSub: "New versions of apps you follow land here",
  notifNew: "A new version of {n} is out",
  notifsEmpty: "No notifications yet",
  notifsEmptySub: "Tap “Follow” on any app page to see its new versions here.",
  markAllRead: "Mark all as read",
  markRead: "Mark read",
  viewApp: "View app",
  loading: "Loading…",
  versions: "Previous versions",
  versionsCap: "Download older versions and see what changed in each",
  verSource: "Versions source",
  fresh: "What's new",
  freshSub: "New and freshly updated apps, on this platform",
  freshNew: "Newest additions",
  freshUpd: "Recently updated",
  follow: "Follow",
  following: "Following",
  save: "Save",
  followNote: "We'll let you know when a new version lands.",
  devEmpty: "This developer has no app on this platform.",
  devApps: "Apps by this developer",
  reqApp: "Request an app",
  reqSub: "Tell us about a free app that's missing from the store; we'll review it.",
  reqName: "App name",
  reqLink: "Official source link (optional)",
  reqDesc: "Short note (optional)",
  reqSubmit: "Submit request",
  reqDone: "Request received — once reviewed, it will be added to the store.",
  reqMine: "My requests",
  reqNone: "You haven't requested an app yet.",
  reqNameErr: "Please enter the app name.",
  reqLoginTitle: "Sign in to request an app",
  reqLoginSub: "Requests are tied to your account so you can track them.",
  login: "Sign in",
  signup: "Sign up",
  logout: "Sign out",
  email: "Email",
  password: "Password",
  name: "Name",
  loginTitle: "Sign in",
  signupTitle: "Create account",
  noAccount: "No account yet?",
  haveAccount: "Already have an account?",
  home: "Home",
  themeChange: "Change theme",
  themeIs: "Current theme",
  headerSearch: "Search",
  langSwitch: "تغییر زبان به فارسی",
  appsWord: "apps",
  searchResultsFor: "Search results for",
  resultWord: "results",
  emptyHome: "No app matches this combination.",
  tryAnotherPlatform: "Try another platform.",
  moreApps: "More apps in advanced search",
  backHome: "Back to home",
  backToCats: "Back to categories",
  emptyCat: "No apps in this category yet.",
  minAndroid: "Minimum Android",
  verifyStatus: "Review status",
  verified: "Reviewed",
  pendingReview: "Pending review",
  unknown: "Unknown",
  updateAvailable: "A new version is available!",
  updateFromTo: "From {from} to {to}",
  updateReleased: "Version {v} is out",
  alternatives: "Free alternatives",
  category: "Category",
  terms: "Terms",
  privacy: "Privacy",
  aboutUs: "About us",
  reqStatus_pending: "Under review",
  reqStatus_added: "Added",
  reqStatus_rejected: "Rejected",
  sizeWord: "Size",
  versionWord: "Version",
};

export const STR: Record<Locale, Dict> = { fa, en };
export const t = (l: Locale) => STR[l];

// ─── قالب‌بندی وابسته به زبان ───
export function num(n: number | string, l: Locale): string {
  return l === "fa" ? toFaDigits(n) : String(n);
}
export function bytesL(bytes: number | null | undefined, l: Locale): string {
  if (l === "fa") return formatBytes(bytes);
  if (bytes == null || bytes <= 0) return "Unknown";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  const r = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${r} ${units[i]}`;
}
export function dateL(d: Date | string | null | undefined, l: Locale): string {
  if (l === "fa") return formatDate(d);
  if (!d) return "Unknown";
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
export function platName(l: Locale, p: string): string {
  const d = STR[l];
  if (p === "android") return d.plat_android;
  if (p === "windows") return d.plat_windows;
  if (p === "linux") return d.plat_linux;
  return p;
}
export function appsCount(n: number, l: Locale): string {
  return l === "fa" ? `${toFaDigits(n)} برنامه` : `${n} ${n === 1 ? "app" : "apps"}`;
}

// ─── انتخاب فیلدهای دوزبانه‌ی داده ───
type AppLike = {
  nameFa: string; nameEn: string;
  shortDesc?: string | null; shortDescFa?: string | null;
  description?: string | null; descriptionFa?: string | null;
};
export const appName = (a: AppLike, l: Locale) => (l === "fa" ? a.nameFa : a.nameEn || a.nameFa);
export const appShort = (a: AppLike, l: Locale) =>
  l === "fa" ? a.shortDescFa || a.shortDesc : a.shortDesc || a.shortDescFa;
export const appDesc = (a: AppLike, l: Locale) =>
  l === "fa" ? a.descriptionFa || a.description : a.description || a.descriptionFa;
export const catName = (c: { nameFa: string; nameEn?: string | null }, l: Locale) =>
  l === "fa" ? c.nameFa : c.nameEn || c.nameFa;

export const THEME_NAMES: Record<Locale, Record<string, string>> = {
  fa: { sky: "آسمان زنده", embers: "اخگر زنده", aurora: "شفق زنده", constellation: "صور فلکی زنده" },
  en: { sky: "Living Sky", embers: "Living Embers", aurora: "Living Aurora", constellation: "Living Constellation" },
};

export const YEAR = { fa: "۱۴۰۵", en: "2026" } as const;

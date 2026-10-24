import type { Metadata, Viewport } from "next";
import { Vazirmatn, Cinzel, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BottomSpacer } from "@/components/PlatformNav";
import { SWRegister, InstallButton } from "@/components/PWA";
import ErrorReporter from "@/components/ErrorReporter";
import { siteUrl } from "@/lib/site-url";
import { getLocale } from "@/lib/i18n-server";
import { dirOf } from "@/lib/i18n";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// فونت لاتین — برای متن‌ها و اعداد انگلیسی (فارسی همچنان وزیرمتن)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// فونت وردمارک لاتین Fuse Point — هم‌سبک حکاکی روی لوگو
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});


export const metadata: Metadata = {
  title: { default: "Fuse Point | فروشگاه اپ‌های آزاد", template: "%s | Fuse Point" },
  description: "Fuse Point — فروشگاه اپ‌های آزاد؛ معرفی و دانلود امن نرم‌افزار برای اندروید، ویندوز و لینوکس با لینک مستقیم",
  metadataBase: new URL(siteUrl()),
  openGraph: { locale: "fa_IR", type: "website", siteName: "Fuse Point" },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, title: "Fuse Point", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1428",
};

// فروشگاه دیتامحور است: رندر سمت سرور برای هر درخواست (بدون prerender استاتیک)
export const instant = false;

// تم پیش‌فرض (آسمان زنده) + خواندن انتخاب کاربر
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('vesper-theme');if(t!=='sky'&&t!=='embers'&&t!=='aurora'&&t!=='constellation'){t='sky';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','sky');}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${vazir.variable} ${cinzel.variable} min-h-full flex flex-col`}>
        <SWRegister />
        <ErrorReporter />
        <div className="ambient" aria-hidden="true">
          <span className="glow glow-a" />
          <span className="glow glow-b" />
          <div className="amb-layer amb-stars-a" />
          <div className="amb-layer amb-stars-b" />
          <div className="amb-layer amb-meteor" />
          <div className="amb-layer amb-aurora">
            <span className="band band-1" />
            <span className="band band-2" />
            <span className="band band-3" />
          </div>
          <div className="amb-layer amb-embers-a" />
          <div className="amb-layer amb-embers-b" />
          <div className="amb-layer amb-constellation" />
          <div className="amb-layer amb-const-dots" />
        </div>
        <Header locale={locale} />
        <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 py-6 relative z-[1]">{children}</main>
        <Footer locale={locale} />
        <BottomSpacer />
        <InstallButton />
      </body>
    </html>
  );
}

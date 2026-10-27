import type { Metadata, Viewport } from "next";
import { Vazirmatn, Cinzel, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import PlatformNav, { BottomSpacer } from "@/components/PlatformNav";
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


export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: { default: "Fuse Point | فروشگاه اپ‌های آزاد", template: "%s | Fuse Point" },
    description: locale === "fa"
      ? "Fuse Point — فروشگاه اپ‌های آزاد؛ معرفی و دانلود امن نرم‌افزار برای اندروید، ویندوز و لینوکس با لینک مستقیم"
      : "Fuse Point — the free-software app store; discover and safely download software for Android, Windows and Linux with direct links",
    metadataBase: new URL(siteUrl()),
    openGraph: { locale: locale === "fa" ? "fa_IR" : "en_US", type: "website", siteName: "Fuse Point" },
    robots: { index: true, follow: true },
    appleWebApp: { capable: true, title: "Fuse Point", statusBarStyle: "default" },
    icons: { apple: "/icons/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2f1ec",
};

// فروشگاه دیتامحور است: رندر سمت سرور برای هر درخواست (بدون prerender استاتیک)
export const instant = false;

// تم پیش‌فرض (آسمان زنده) + خواندن انتخاب کاربر
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('vesper-theme');if(t!=='light'&&t!=='sky'&&t!=='embers'&&t!=='aurora'&&t!=='constellation'){t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

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
        <Header locale={locale} />
        <main className="flex-1 w-full max-w-[680px] mx-auto px-4 pt-4 relative z-[1]"><PageTransition>{children}</PageTransition></main>
        <Footer locale={locale} />
        <PlatformNav locale={locale} />
        <BottomSpacer />
        <InstallButton />
      </body>
    </html>
  );
}

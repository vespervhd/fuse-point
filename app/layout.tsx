import type { Metadata, Viewport } from "next";
import { Vazirmatn, Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SWRegister, InstallButton } from "@/components/PWA";
import ErrorReporter from "@/components/ErrorReporter";
import { siteUrl } from "@/lib/site-url";

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

// فونت مونواسپیس — متادیتای فنی جهت «ج» (نسخه، حجم، هش، اسلاگ)
const jbmono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
});

// فونت وردمارک لاتین Vesper — هم‌سبک حکاکی روی لوگو
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});


export const metadata: Metadata = {
  title: { default: "Vesper | فروشگاه اپ‌های آزاد", template: "%s | Vesper" },
  description: "Vesper — فروشگاه اپ‌های آزاد؛ معرفی و دانلود امن نرم‌افزار برای اندروید، ویندوز و لینوکس با لینک مستقیم",
  metadataBase: new URL(siteUrl()),
  openGraph: { locale: "fa_IR", type: "website", siteName: "Vesper" },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, title: "Vesper", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0c0e",
};

// فروشگاه دیتامحور است: رندر سمت سرور برای هر درخواست (بدون prerender استاتیک)
export const instant = false;

// تم پیش‌فرض daisyUI + خواندن انتخاب کاربر
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('vesper-theme');if(t!=='protool'&&t!=='dim'&&t!=='dracula'&&t!=='halloween'&&t!=='luxury'&&t!=='forest'){t='protool';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${vazir.variable} ${cinzel.variable} ${jbmono.variable} min-h-full flex flex-col`}>
        <SWRegister />
        <ErrorReporter />
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-[1]">{children}</main>
        <Footer />
        <InstallButton />
      </body>
    </html>
  );
}

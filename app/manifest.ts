import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fuse Point — فروشگاه اپ‌های آزاد",
    short_name: "Fuse Point",
    description: "فروشگاه اپ‌های آزاد؛ معرفی و دانلود امن نرم‌افزار برای اندروید، ویندوز و لینوکس",
    start_url: "/",
    scope: "/",
    display: "standalone",
    dir: "rtl",
    lang: "fa",
    background_color: "#f7f8fa",
    theme_color: "#0d7a5f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

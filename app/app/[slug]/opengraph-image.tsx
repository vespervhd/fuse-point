import { ImageResponse } from "next/og";
import { getAppBySlug } from "@/lib/store";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  const name = app?.nameFa || "Fuse Point";
  const platFa =
    app?.platform === "android" ? "اندروید" : app?.platform === "windows" ? "ویندوز" : app?.platform === "linux" ? "لینوکس" : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f14",
          color: "#fff",
          fontFamily: "sans-serif",
          direction: "rtl",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, marginBottom: 16 }}>{name}</div>
        {platFa && <div style={{ fontSize: 32, color: "#2dd4bf" }}>دانلود برای {platFa}</div>}
        <div style={{ fontSize: 28, color: "#888", marginTop: 32 }}>Fuse Point · فروشگاه فارسی نرم‌افزار</div>
      </div>
    ),
    { ...size }
  );
}

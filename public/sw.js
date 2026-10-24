// Service Worker Fuse Point — کش امن در برابر پوسته‌ی کهنه
// قانون طلایی: اسناد (ناوبری‌ها) همیشه network-first؛ کش سند فقط فال‌بک آفلاین است.
// این‌طوری هیچ نسخه‌ی قدیمی‌ای از HTML روی دستگاه کاربر گیر نمی‌کند.
const CACHE = "fuse-point-v8";
const PRECACHE = ["/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// دارایی‌های واقعاً استاتیک (هش‌دار یا آیکن/فونت/تصویر) — کش‌اول اشکالی ندارد
function isStaticAsset(url, request) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // فقط درخواست‌های همین مبدأ
  if (url.origin !== self.location.origin) return;
  // استثنای مجاز: /api/img پاسخِ immutable دارد (تصویر با URL ثابت) — cache-first
  // با به‌روزرسانیِ پس‌زمینه. این شاخه فقط تصویر است؛ HTML هرگز به آن نمی‌رسد.
  if (url.pathname === "/api/img") {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }
  // API و ادمین: هرگز کش نشوند، مستقیم از شبکه
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  const isDocument = request.mode === "navigate" || request.destination === "document";

  if (isDocument) {
    // network-first: پاسخ تازه همیشه برنده است؛ کش فقط وقتی شبکه نیست
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("/");
        })
    );
    return;
  }

  if (isStaticAsset(url, request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // بقیه‌ی GETهای هم‌مبدأ (مثل RSC) هم network-first — کش فقط فال‌بک
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw new Error("offline and not cached");
    })
  );
});

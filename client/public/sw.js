/* Service worker minimal PWA: cache app shell, /api tetap network-only. */
const CACHE = "aksara-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // API & OAuth: selalu jaringan
  if (url.pathname.startsWith("/api/")) return;
  // Navigasi: coba jaringan, fallback cache
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/index.html")));
    return;
  }
  // Aset statik: cache-first
  e.respondWith(
    caches.match(e.request).then(
      (hit) => hit || fetch(e.request)
    )
  );
});

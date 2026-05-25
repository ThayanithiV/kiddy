const STATIC_CACHE = "kiddy-vogue-static-v2";
const APP_SHELL = ["/manifest.webmanifest", "/pwa-icon.svg", "/pwa-maskable.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Never cache API calls.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // For page refresh/navigation, prefer the latest network response and
  // fall back to cached index only when offline.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put("/", responseClone));
          return networkResponse;
        })
        .catch(async () => {
          const cachedHome = await caches.match("/");
          return cachedHome || Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(event.request));
    })
  );
});

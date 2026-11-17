const CACHE_NAME = "loveconnect-shell-v1";
const APP_SHELL = [
  "/Loveconnect/",
  "/Loveconnect/manifest.json",
  "/Loveconnect/icons/loveconnect.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith("loveconnect-shell-") && key !== CACHE_NAME)
        .map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Never cache Supabase, authentication, messages, profile data, or other APIs.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put("/Loveconnect/", copy));
        return response;
      }).catch(() => caches.match("/Loveconnect/"))
    );
    return;
  }

  if (url.pathname.startsWith("/Loveconnect/icons/") ||
      url.pathname === "/Loveconnect/manifest.json") {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
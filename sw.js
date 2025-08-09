// Simple service worker for speed: cache-first for static assets,
// network-first for HTML pages. Works on GitHub Pages or any static host.
const VERSION = "aor-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;

self.addEventListener("install", (e) => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) =>
          k.startsWith("aor-") && k !== STATIC_CACHE && k !== PAGES_CACHE
            ? caches.delete(k)
            : null
        )
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const dest = req.destination; // 'document','style','script','image','font',...

  // Network-first for HTML/documents
  if (dest === "document" || req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Cache-first for static assets
  if (["style", "script", "image", "font"].includes(dest)) {
    event.respondWith(cacheFirst(req));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("You are offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

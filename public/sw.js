// JA Automóveis Service Worker (restored)
// Static: cache-first | Dynamic: stale-while-revalidate
// APIs: network-first; for /api/vehicles force no-store
// Images: cache-first; for /uploads network-first (no-store)

const STATIC_CACHE = 'ja-static-v4';
const DYNAMIC_CACHE = 'ja-dynamic-v4';
const IMAGE_CACHE = 'ja-images-v4';
const API_CACHE = 'ja-api-v4';

const STATIC_URLS = ['/', '/assets/logo.png', '/assets/favicon-32x32.png', '/assets/homepageabout.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_URLS)),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE].includes(n)).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

async function cachePut(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);
    const headers = new Headers(response.headers);
    headers.set('x-cache-timestamp', Date.now().toString());
    const cached = new Response(response.clone().body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    await cache.put(request, cached);
  } catch {}
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const resp = await fetch(request);
  if (resp && resp.status === 200) cachePut(cacheName, request, resp);
  return resp;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const resp = await fetch(request);
    if (resp && resp.status === 200) cachePut(cacheName, request, resp);
    return resp;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error('Network failed and no cache');
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((resp) => {
      if (resp && resp.status === 200) cachePut(cacheName, request, resp);
      return resp;
    })
    .catch(() => cached);
  return cached || networkPromise;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          cachePut(DYNAMIC_CACHE, request, resp);
          return resp;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  if (request.destination === 'image') {
    if (url.pathname.startsWith('/uploads/')) {
      const noStoreReq = new Request(request, { headers: { ...Object.fromEntries(request.headers), 'Cache-Control': 'no-store' } });
      event.respondWith(networkFirst(noStoreReq, IMAGE_CACHE).catch(() => new Response(
        "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='100%' height='100%' fill='#e5e7eb'/></svg>")
      )));
      return;
    }
    event.respondWith(cacheFirst(request, IMAGE_CACHE).catch(() => new Response(
      "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='100%' height='100%' fill='#e5e7eb'/></svg>")
    )));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.startsWith('/api/vehicles')) {
      const headersObject = Object.fromEntries(request.headers);
      const bustReq = new Request(request, { headers: { ...headersObject, 'x-skip-cache': 'true', 'Cache-Control': 'no-store' } });
      event.respondWith(networkFirst(bustReq, API_CACHE));
      return;
    }
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});
// Service Worker for NBA My Career (PWA)
// Strategy: cache-first for core assets, network-first fallback for everything else,
// with offline fallback to index.html for navigations.

const CACHE = 'nbacareer-v2026-05-18-1';
const CORE_ASSETS = [
  './',
  './index.html',
  './guide.html',
  './manifest.json',
  './icon.svg',
  'https://unpkg.com/react@18.2.0/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // addAll is atomic — any failure aborts the install.
      // Use individual put() calls so a slow CDN doesn't break first install.
      Promise.all(
        CORE_ASSETS.map((url) =>
          fetch(url, { cache: 'reload', mode: url.startsWith('http') ? 'cors' : 'same-origin' })
            .then((r) => (r.ok ? c.put(url, r) : null))
            .catch(() => null)
        )
      )
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Don't intercept the version.json or the offline html — those need fresh fetches.
  const url = new URL(req.url);
  if (url.pathname.endsWith('/version.json') || url.pathname.endsWith('/nbacareer-local.html')) {
    return; // let browser handle directly
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Cache hit: serve immediately, refresh in background (stale-while-revalidate)
        fetch(req)
          .then((resp) => {
            if (resp && resp.ok) {
              caches.open(CACHE).then((c) => c.put(req, resp.clone()));
            }
          })
          .catch(() => {});
        return cached;
      }
      // Cache miss: go to network and cache the response
      return fetch(req)
        .then((resp) => {
          if (
            resp.ok &&
            (req.url.startsWith(self.location.origin) || req.url.includes('unpkg.com'))
          ) {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return resp;
        })
        .catch(() => {
          // Offline fallback: navigations get index.html, otherwise nothing
          if (req.mode === 'navigate') return caches.match('./index.html');
        });
    })
  );
});

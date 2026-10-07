// Network-first: altijd de nieuwste versie als je online bent, cache als fallback offline.
const CACHE = 'schetsveld-v2';
const FILES = ['schetsveld.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    // Eigen bestanden: HTTP-cache van GitHub Pages (10 min) overslaan, zodat updates meteen doorkomen.
    fetch(e.request, new URL(e.request.url).origin === location.origin ? { cache: 'no-cache' } : {})
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

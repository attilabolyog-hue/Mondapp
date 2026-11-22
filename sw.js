// Hálózat először (friss verzió), hiba esetén gyorsítótár (net nélkül is megy).
const C = 'monddapp-v3';
self.addEventListener('install', e => e.waitUntil(
  caches.open(C).then(c => c.addAll(['./', 'words.js', 'jatekok.js', 'hangkepzes.js', 'manifest.json', 'icon-192.png', 'icon-512.png'])).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});

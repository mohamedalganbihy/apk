const CACHE_NAME = 'elganbihy-repair-app-v7';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png', './hero-banner.jpg'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async (asset) => {
      try { const response = await fetch(asset, {cache:'no-cache'}); if (response.ok) await cache.put(asset, response); } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).catch(() => {});
      return response;
    }).catch(() => caches.match(request)));
    return;
  }
  event.respondWith(fetch(request).then(response => {
    if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).catch(() => {});
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html'))));
});

// Choose a cache name
const cacheName = 'calcoloprezzi-pro-v1';

// List the files to cache
const filesToCache = [
  '/',
  '/manifest.json'
];

// Install the service worker and cache the files
self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(filesToCache);
    })()
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      // Don't cache everything, especially API calls
      if (e.request.method === 'GET' && !e.request.url.includes('/api/')) {
          cache.put(e.request, response.clone());
      }
      return response;
    })()
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

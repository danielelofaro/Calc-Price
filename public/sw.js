'use strict';

const CACHE_NAME = 'calcoloprezzi-pro-cache-v1';
const FILES_TO_CACHE = [
    '/',
    '/manifest.json',
    '/icon-192.svg',
    '/icon-512.svg'
];

self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
    if (evt.request.method !== 'GET') {
        evt.respondWith(fetch(evt.request));
        return;
    }

    if (evt.request.headers.get('accept').includes('text/html')) {
        evt.respondWith(
            fetch(evt.request).catch(() => {
                return caches.match('/');
            })
        );
        return;
    }

    evt.respondWith(
        caches.match(evt.request).then((response) => {
            return response || fetch(evt.request).then((response) => {
                if (response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(evt.request, responseToCache);
                    });
                }
                return response;
            });
        })
    );
});

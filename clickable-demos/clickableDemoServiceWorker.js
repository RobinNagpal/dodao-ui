"use strict";
/// <reference lib="webworker" />
const CACHE_NAME = 'clickable-demos-cache-v1';
self.addEventListener('install', (event) => {
    if (!(event instanceof ExtendableEvent)) {
        return;
    }
    const selfObj = self;
    if (typeof selfObj.skipWaiting === 'function') {
        selfObj.skipWaiting();
    }
});
self.addEventListener('fetch', (event) => {
    if (!(event instanceof FetchEvent)) {
        return;
    }
    event.respondWith(caches.match(event.request).then((response) => {
        if (response) {
            console.log('Serving from cache', event.request.url);
            return response;
        }
        return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    console.log('Caching', event.request.url);
                    cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
        });
    }));
});
self.addEventListener('activate', (event) => {
    if (!(event instanceof ExtendableEvent)) {
        return;
    }
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
                return caches.delete(cacheName);
            }
            else {
                return Promise.resolve(false);
            }
        }));
    }));
});
self.addEventListener('message', (event) => {
    if (!(event instanceof ExtendableMessageEvent)) {
        return;
    }
    if (event.data && event.data.type === 'CACHE_URLS') {
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll(event.data.payload);
        });
    }
});

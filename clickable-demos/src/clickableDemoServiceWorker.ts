/// <reference lib="webworker" />

const CACHE_NAME = 'clickable-demos-cache-v1';

self.addEventListener('install', (event: Event) => {
  if (!(event instanceof ExtendableEvent)) {
    return;
  }

  const selfObj = self as any;
  if (typeof selfObj.skipWaiting === 'function') {
    selfObj.skipWaiting();
  }
});

self.addEventListener('fetch', (event: Event) => {
  if (!(event instanceof FetchEvent)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response: Response | undefined) => {
      if (response) {
        console.log('Serving from cache', event.request.url);
        return response;
      }

      return fetch(event.request).then((networkResponse: Response) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache: Response = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache: Cache) => {
            console.log('Caching', event.request.url);
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      });
    })
  );
});

self.addEventListener('activate', (event: Event) => {
  if (!(event instanceof ExtendableEvent)) {
    return;
  }

  const cacheWhitelist: string[] = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames: string[]) => {
      return Promise.all(
        cacheNames.map((cacheName: string) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          } else {
            return Promise.resolve(false);
          }
        })
      );
    })
  );
});

self.addEventListener('message', (event: Event) => {
  if (!(event instanceof ExtendableMessageEvent)) {
    return;
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    caches.open(CACHE_NAME).then((cache: Cache) => {
      cache.addAll(event.data.payload as string[]);
    });
  }
});

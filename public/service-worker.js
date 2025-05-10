// Service Worker for IndoQuran Web App
const CACHE_NAME = 'indoquran-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
  '/fonts/NotoNaskhArabic%5Bwght%5D.ttf',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const API_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => {
          return name !== CACHE_NAME;
        }).map((name) => {
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if a request is for an API
const isApiRequest = (request) => {
  return request.url.includes('/api/');
};

// Helper function to determine if a request is for a Quran data API
const isQuranDataRequest = (request) => {
  // Requests for surah data, ayat data, tafsir, etc.
  return request.url.includes('/api/quran/') || 
         request.url.includes('/api/surah/') || 
         request.url.includes('/api/ayat/');
};

// Fetch event - handle cache strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available for static assets
        if (cachedResponse && !isApiRequest(event.request)) {
          return cachedResponse;
        }

        // For API requests, implement a network-first strategy
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses or non-Quran data API responses
            if (!response.ok || !isQuranDataRequest(event.request)) {
              return response;
            }

            // Clone the response as it's a stream and can only be consumed once
            const responseToCache = response.clone();

            // Cache Quran data API responses
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // If network fails, try to return any cached response
            // This helps with offline access
            return cachedResponse;
          });
      })
  );
});

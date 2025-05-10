// Service Worker for IndoQuran Web App - With Offline Support

const CACHE_NAME = 'indoquran-cache-v1';
const DYNAMIC_CACHE_NAME = 'indoquran-dynamic-cache-v1';

// Resources to cache immediately when the service worker is installed
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/kontak',
  '/kebijakan-privasi',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/fonts/NotoNaskhArabic%5Bwght%5D.ttf'
];

// Skip waiting and claim clients immediately to ensure the new service worker takes control
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle navigation requests separately - attempt to serve from cache first for specific pages
  if (event.request.mode === 'navigate') {
    const url = new URL(event.request.url);
    const pathname = url.pathname;
    
    // Special handling for contact and privacy policy pages
    if (pathname === '/kontak' || pathname === '/kebijakan-privasi') {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || fetch(event.request)
              .catch(() => caches.match('/offline'));
          })
      );
      return;
    }
    
    // Default navigation handling
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline');
        })
    );
    return;
  }
  
  // For API requests, prefer network first, fallback to cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Only cache valid responses
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response before returning it
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => {
              // Store response in cache but don't wait for it
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } 
  // For Quran content and static pages, use cache first strategy with background refresh
  else if (event.request.url.includes('/surah/') || 
           event.request.url.includes('/juz/') || 
           event.request.url.includes('/quran/') ||
           event.request.url.includes('/kontak') ||
           event.request.url.includes('/kebijakan-privasi')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached response immediately if available
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                // Update the cache with the new response
                caches.open(DYNAMIC_CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, networkResponse.clone());
                  });
              }
              return networkResponse;
            })
            .catch(error => {
              console.log('Fetch failed for Quran content:', error);
              // If both cache and network fail, return nothing
              return new Response(JSON.stringify({
                error: 'Network request failed and no cached data available'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
            
          return cachedResponse || fetchPromise;
        })
    );
  } 
  // For static assets (fonts, images, css, js, etc.), use cache first with network fallback
  else if (
    event.request.url.match(/\.(js|css|png|jpeg|jpg|gif|svg|ttf|woff|woff2)$/) ||
    event.request.url.includes('/fonts/') ||
    event.request.url.includes('/icons/')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and refresh cache in background
            fetch(event.request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse);
                  });
                }
              })
              .catch(error => console.log('Background refresh failed:', error));
              
            return cachedResponse;
          }
          
          // Not in cache, try network
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone and cache the fresh response
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
  }
  // For all other requests, use network first with cache fallback
  else {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Only cache valid responses
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response before returning it
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});

// Log when service worker is installed
console.log('Service Worker installed - Offline caching enabled');

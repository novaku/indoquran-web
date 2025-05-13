// Service worker for IndoQuran-Web app

// Cache version (change this whenever service worker needs updating)
const CACHE_VERSION = 'v1.0.0';

// Cache names
const STATIC_CACHE = `indoquran-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `indoquran-dynamic-${CACHE_VERSION}`;
const QURAN_CACHE = `indoquran-quran-${CACHE_VERSION}`;

// Resources that should be pre-cached
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/favicon.ico',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/fonts/Amiri-Regular.ttf',
  '/fonts/Amiri-Bold.ttf',
  '/fonts/UthmanicHafs.ttf'
];

// Install event - precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching app shell and static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, QURAN_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          console.log('Deleting old cache:', cacheToDelete);
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => self.clients.claim())
  );
});

// Helper function for determining if a request is for a Quran surah data
const isQuranRequest = (url) => {
  return url.includes('/api/quran') || url.includes('/api/surah');
};

// Helper for network-first with fallback strategy
const networkFirstWithFallback = async (request, cacheName) => {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache the response if successful
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a page request, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    // Otherwise just throw
    throw error;
  }
};

// Fetch event handler with different strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Don't cache browser-sync and socket.io requests during development
  if (url.hostname === 'localhost' && 
    (url.pathname.includes('browser-sync') || url.pathname.includes('socket.io'))) {
    return;
  }

  // Strategy for Quran data - cache with long TTL, but update in background
  if (isQuranRequest(url.pathname)) {
    event.respondWith(networkFirstWithFallback(request, QURAN_CACHE));
    return;
  }

  // Strategy for API requests - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithFallback(request, DYNAMIC_CACHE));
    return;
  }

  // Static assets strategy - cache first, fallback to network
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.startsWith('/fonts/') || 
      url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => cachedResponse || fetch(request)
          .then(networkResponse => {
            return caches.open(STATIC_CACHE)
              .then(cache => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
              });
          })
        )
    );
    return;
  }

  // Default strategy for everything else - try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Clone the response
          const responseToCache = networkResponse.clone();
          
          // Cache the fetched response
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          
          return networkResponse;
        })
        .catch(() => {
          // If it's a HTML request, return the offline page
          if (request.headers.get('Accept').includes('text/html')) {
            return caches.match('/offline');
          }
        });
      })
  );
});

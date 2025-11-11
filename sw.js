// sw.js

const CACHE_VERSION = 'v1.4'; // Version bumped to trigger re-installation.
const APP_CACHE_NAME = `bitimaps-app-${CACHE_VERSION}`;
const API_CACHE_NAME = `bitimaps-api-${CACHE_VERSION}`;

// List of essential files for the App Shell.
// Caching only local, essential files makes the service worker installation
// more robust and less likely to fail due to network issues with external resources.
// Other resources will be cached at runtime by the 'fetch' event handler.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json' // Caching the manifest is a good practice.
];

// Install event: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME)
      .then((cache) => {
        console.log(`Service Worker (${CACHE_VERSION}): Caching App Shell`);
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => {
        console.log(`Service Worker (${CACHE_VERSION}): App Shell cached, activating now.`);
        return self.skipWaiting(); // Force the new service worker to activate immediately
      })
      .catch(error => {
        console.error(`Service Worker (${CACHE_VERSION}): Failed to cache App Shell.`, error);
      })
  );
});

// Activate event: clean up old caches and take control
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [APP_CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Service Worker (${CACHE_VERSION}): Deleting old cache`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`Service Worker (${CACHE_VERSION}): Claiming clients.`);
      return self.clients.claim(); // Take control of all open pages
    })
  );
});

// Fetch event: serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategy for Supabase API calls: Network first, then cache
  if (url.hostname.endsWith('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // If the request is successful, cache it.
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(API_CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If the network fails, try to serve from the cache.
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Provide a fallback error response if offline and not in cache
            return new Response(JSON.stringify({ error: 'Offline and no data in cache' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // Strategy for all other requests: Cache first, then network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return from cache if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(request);
      })
  );
});
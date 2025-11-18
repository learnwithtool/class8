const CACHE_NAME = 'quiz-app-v1.1';
const urlsToCache = [
    './', // Caches index.html implicitly
    './index.html', 
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js'
    // Caching the external library URLs is crucial for offline use.
];

// Install event: Caches all necessary files
self.addEventListener('install', event => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting(); 
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('[Service Worker] Failed to cache resources:', err);
                });
            })
    );
});

// Activate event: Cleans up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Takes control of pages immediately
    );
});

// Fetch event: Serves content from cache first, then network (Cache-First strategy)
self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // No cache hit - fetch from network
                return fetch(event.request).catch(error => {
                    // This catches network failures for non-cached items
                    console.log('[Service Worker] Fetch failed:', event.request.url);
                });
            })
    );
});
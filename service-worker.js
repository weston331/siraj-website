// Service Worker for Siraj Al-Athar Website
// Version 2.0 - Progressive Web App Support

const CACHE_VERSION = 'siraj-v2.1.0';
const CACHE_NAME = `siraj-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/fonts/material-symbols-rounded.woff2',
    '/images/logo.svg',
    '/404.html',
    'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0'
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[Service Worker] Precache failed:', error);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('siraj-cache-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip analytics API requests (not implemented yet)
    if (url.pathname.includes('/api/analytics')) {
        return;
    }

    // Skip cross-origin requests for external APIs
    if (url.origin !== location.origin && !url.href.includes('fonts.googleapis.com') && !url.href.includes('fonts.gstatic.com')) {
        return;
    }

    // Determine strategy based on request type
    let strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;

    // Images: Cache first
    if (request.destination === 'image') {
        strategy = CACHE_STRATEGIES.CACHE_FIRST;
    }
    // HTML: Network first
    else if (request.destination === 'document') {
        strategy = CACHE_STRATEGIES.NETWORK_FIRST;
    }
    // Fonts: Cache first
    else if (url.href.includes('fonts.googleapis.com') || url.href.includes('fonts.gstatic.com')) {
        strategy = CACHE_STRATEGIES.CACHE_FIRST;
    }

    event.respondWith(handleFetch(request, strategy));
});

// Handle fetch with different strategies
async function handleFetch(request, strategy) {
    const cache = await caches.open(CACHE_NAME);

    switch (strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cacheFirst(request, cache);
        
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return networkFirst(request, cache);
        
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        default:
            return staleWhileRevalidate(request, cache);
    }
}

// Cache First Strategy
async function cacheFirst(request, cache) {
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network First Strategy
async function networkFirst(request, cache) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        
        // Return offline page for HTML requests
        if (request.destination === 'document') {
            const offlinePage = await cache.match('/404.html');
            if (offlinePage) {
                return offlinePage;
            }
        }
        
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cache) {
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-analytics') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    // Implement analytics syncing when back online
    console.log('[Service Worker] Syncing analytics data...');
}

// Push notifications support (for future use)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'إشعار جديد من سِراج الأطهار',
        icon: '/images/logo.svg',
        badge: '/images/logo.svg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('سِراج الأطهار', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

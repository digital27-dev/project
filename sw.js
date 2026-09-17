const CACHE_NAME = 'sanz-chat-v1';
const ASSETS_TO_CACHE = [
    '/chat.html',
    '/index.html',
    '/manifest.json' 
];

// 1. Install & Cache (Fitur PWA)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Diambil dari script kedua
});

// 2. Activate & Bersihkan Cache Lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return clients.claim(); // Diambil dari script kedua
        })
    );
});

// 3. Fetch (Agar bisa dibuka offline/diinstal)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// ==========================================
// BAGIAN NOTIFIKASI (DISAMAKAN DENGAN SCRIPT KEDUA)
// ==========================================

self.addEventListener('push', function(e) {
    // Dibiarkan kosong seperti script kedua milikmu yang berfungsi
}); 

self.addEventListener('notificationclick', function(e) { 
    e.notification.close(); 
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) client = clientList[i];
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
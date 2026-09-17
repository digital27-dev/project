const CACHE_NAME = 'sanz-chat-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json' 
];

self.addEventListener('install', (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );

    self.skipWaiting();
});

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
            return clients.claim(); 
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('push', function(e) {

    let data = { 
        title: 'Sanz', 
        body: 'Ada pesan baru untukmu!', 
        icon: 'https://img91.wordpress.com/wp-content/uploads/2026/09/24753_192x192.png' 
    };
    
    if (e.data) {
        try {
            data = e.data.json(); 
        } catch (err) {
            data.body = e.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || 'https://img91.wordpress.com/wp-content/uploads/2026/09/24753_192x192.png',
        badge: 'https://img91.wordpress.com/wp-content/uploads/2026/09/24753_192x192.png', 
        vibrate: [200, 100, 200], 
        data: {
            dateOfArrival: Date.now()
        }
    };

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
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
const CACHE_NAME = 'sanz-chat-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json' // Pastikan kamu sudah membuat file ini seperti panduan sebelumnya
];

self.addEventListener('install', (event) => {
    // Menyimpan aset ke cache agar web bisa diinstal (PWA standard)
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Memaksa service worker baru untuk langsung aktif (kodemu yang sangat berguna untuk chat app)
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Membersihkan cache lama jika ada update, lalu mengambil alih kontrol
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
            return clients.claim(); // Kodemu sebelumnya
        })
    );
});

// Intercept fetch agar PWA bisa memuat halaman saat offline/koneksi buruk
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// MENANGANI NOTIFIKASI LATAR BELAKANG
self.addEventListener('push', function(e) {
    // Data default jika payload kosong
    let data = { 
        title: 'Sanz Chat', 
        body: 'Ada pesan baru untukmu!', 
        icon: '/icon-192x192.png' // Pastikan gambar ini ada di foldermu
    };
    
    // Menangkap data yang dikirim dari server backend
    if (e.data) {
        try {
            data = e.data.json(); 
        } catch (err) {
            data.body = e.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png', // Ikon kecil di status bar Android
        vibrate: [200, 100, 200], // Pola getaran
        data: {
            dateOfArrival: Date.now()
        }
    };

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
}); 

// Kodemu sebelumnya: Sangat efisien untuk UX!
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
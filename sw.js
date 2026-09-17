self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function(e) {
    const data = e.data ? e.data.json() : {};
    
    const title = data.title || "Notifikasi Baru";
    const options = {
        body: data.body || "Anda mendapat pesan baru.",
        icon: '/icon-192x192.png', 
        badge: '/badge-72x72.png', 
        vibrate: [200, 100, 200],
        data: { url: data.url || '/chat.html' }
    };

    e.waitUntil(
        self.registration.showNotification(title, options)
    );
}); 

self.addEventListener('notificationclick', function(e) { 
    e.notification.close(); 
    
    const urlToOpen = e.notification.data.url;

    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];

                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
      
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
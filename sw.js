
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function(e) {
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
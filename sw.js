self.addEventListener('push', function(e) {
    // Biarkan kosong jika belum pakai Web Push API dari server
}); 

self.addEventListener('notificationclick', function(e) { 
    e.notification.close(); 
    // Baris di bawah ini opsional: berfungsi untuk mengembalikan fokus ke tab chat saat notifikasi diklik
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
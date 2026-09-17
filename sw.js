self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

function decryptMessage(text) {
    if (text && typeof text === 'string' && text.startsWith("ENC::")) {
        try {

            const base64Str = text.replace("ENC::", "");
            
            const binaryString = atob(base64Str);
            
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            let decodedText = new TextDecoder('utf-8').decode(bytes);
            
            try {
                decodedText = decodeURIComponent(decodedText);
            } catch (e) {

            }

            return decodedText;

        } catch (e) {
            console.error("Gagal melakukan dekripsi:", e);

            return "Kamu menerima pesan baru"; 
        }
    }
    return text;
}

self.addEventListener('push', function(e) {
    let data = {};
    
    if (e.data) {
        try {
            data = e.data.json();
        } catch (err) {
            console.error("Gagal parse push data", err);
        }
    }
    
    const decryptedBody = decryptMessage(data.body || "");
    
    const title = data.title || "Notifikasi Baru";
    const options = {
        body: decryptedBody || "Anda mendapat pesan baru.",
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
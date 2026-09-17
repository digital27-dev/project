self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Fungsi dekripsi modern menggunakan TextDecoder untuk support penuh Emoji & Spasi
function decryptMessage(text) {
    if (text && typeof text === 'string' && text.startsWith("ENC::")) {
        try {
            // 1. Hapus prefix "ENC::"
            const base64Str = text.replace("ENC::", "");
            
            // 2. Decode base64 menjadi string biner
            const binaryString = atob(base64Str);
            
            // 3. Konversi ke array byte (Uint8Array)
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // 4. Decode array byte tersebut sebagai UTF-8 murni (Support penuh Emoji)
            let decodedText = new TextDecoder('utf-8').decode(bytes);
            
            // 5. (Opsional) Jika frontend menggunakan encodeURIComponent saat enkripsi (spasi jadi %20)
            try {
                decodedText = decodeURIComponent(decodedText);
            } catch (e) {
                // Abaikan jika tidak di-encode dengan URI
            }

            return decodedText;

        } catch (e) {
            console.error("Gagal melakukan dekripsi:", e);
            // Tampilkan teks aman jika enkripsi benar-benar tidak bisa dibaca
            return "Kamu menerima pesan baru 💬"; 
        }
    }
    return text;
}

self.addEventListener('push', function(e) {
    let data = {};
    
    // Parse data JSON dari server
    if (e.data) {
        try {
            data = e.data.json();
        } catch (err) {
            console.error("Gagal parse push data", err);
        }
    }
    
    // Proses dekripsi body sebelum ditampilkan di notifikasi
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
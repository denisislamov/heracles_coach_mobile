// Heracles Coach — Service Worker
// Handles Web Push notifications from the server

// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Handle push events sent from the server via Web Push protocol
self.addEventListener('push', (event) => {
    let data = { title: 'Heracles Coach 🏋️', body: 'You have a new notification!' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'Heracles Coach 🏋️', {
            body: data.body || data.message || 'Check your health dashboard!',
            icon: '/static/icons/icon-192.svg',
            tag: data.tag || 'general',
            renotify: true,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            actions: [
                { action: 'open', title: 'Open App' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
        })
    );
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            return self.clients.openWindow('/dashboard/');
        })
    );
});

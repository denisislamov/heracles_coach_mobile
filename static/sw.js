// Heracles Coach — Service Worker
// Handles push notifications and offline workout reminders

const REMINDER_DELAY = 5 * 60 * 1000; // 5 minutes in ms
let reminderTimeout = null;

// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Listen for messages from the main page
self.addEventListener('message', (event) => {
    const data = event.data;

    if (data.type === 'USER_LEFT') {
        // User left the app — schedule a reminder in 5 minutes
        clearTimeout(reminderTimeout);
        reminderTimeout = setTimeout(() => {
            showWorkoutReminder();
        }, REMINDER_DELAY);
    }

    if (data.type === 'USER_RETURNED') {
        // User came back — cancel the reminder
        clearTimeout(reminderTimeout);
    }
});

// Show the workout reminder push notification
function showWorkoutReminder() {
    self.registration.showNotification('Heracles Coach 🏋️', {
        body: "Don't forget your workout! Even 15 minutes of exercise will boost your recovery.",
        icon: '/static/icons/icon-192.png',
        badge: '/static/icons/icon-72.png',
        tag: 'workout-reminder',
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' },
        ],
    });
}

// Handle push events (from server-side push, if implemented later)
self.addEventListener('push', (event) => {
    let data = { title: 'Heracles Coach', body: 'You have a new notification!' };

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
            icon: '/static/icons/icon-192.png',
            badge: '/static/icons/icon-72.png',
            tag: data.tag || 'general',
            vibrate: [200, 100, 200],
        })
    );
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // Focus existing tab if open
            for (const client of clients) {
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new tab
            return self.clients.openWindow('/dashboard/');
        })
    );
});


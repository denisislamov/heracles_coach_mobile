/**
 * Heracles Coach — Push Notification Manager
 *
 * Registers the Service Worker and tracks when the user leaves/returns.
 * If the user leaves the app for 5 minutes, a push notification fires:
 *   "Don't forget your workout!"
 */
(function () {
    'use strict';

    if (!('serviceWorker' in navigator)) {
        console.log('Service Workers not supported');
        return;
    }

    // Register Service Worker
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
            console.log('SW registered:', registration.scope);

            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().then((perm) => {
                    console.log('Notification permission:', perm);
                });
            }
        })
        .catch((err) => {
            console.error('SW registration failed:', err);
        });

    // Track visibility — tell SW when user leaves / returns
    document.addEventListener('visibilitychange', () => {
        if (!navigator.serviceWorker.controller) return;

        if (document.visibilityState === 'hidden') {
            // User left the app (switched tab, closed, minimized)
            navigator.serviceWorker.controller.postMessage({ type: 'USER_LEFT' });
        } else if (document.visibilityState === 'visible') {
            // User came back
            navigator.serviceWorker.controller.postMessage({ type: 'USER_RETURNED' });
        }
    });

    // Also fire USER_LEFT on page unload (closing the tab)
    window.addEventListener('beforeunload', () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'USER_LEFT' });
        }
    });
})();


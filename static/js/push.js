/**
 * Heracles Coach — Web Push Registration
 *
 * Registers Service Worker, subscribes to Web Push via VAPID,
 * and sends subscription to the server for real push delivery
 * even when the browser/tab is closed.
 */
(function () {
    'use strict';

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return;
    }

    const VAPID_META = document.querySelector('meta[name="vapid-key"]');
    if (!VAPID_META) return;
    const applicationServerKey = urlBase64ToUint8Array(VAPID_META.content);

    navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
            console.log('SW registered:', registration.scope);
            return registration.pushManager.getSubscription().then((sub) => {
                if (sub) {
                    sendSubscriptionToServer(sub);
                }
            });
        })
        .catch((err) => console.error('SW registration failed:', err));

    // Expose subscribe function for the bell button
    window.heraclesPush = {
        subscribe: async function () {
            const registration = await navigator.serviceWorker.ready;
            let sub = await registration.pushManager.getSubscription();

            if (!sub) {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    return { error: 'denied' };
                }
                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey,
                });
                await sendSubscriptionToServer(sub);
            }
            return { ok: true };
        },
    };

    function sendSubscriptionToServer(subscription) {
        const data = subscription.toJSON();
        return fetch('/notifications/api/subscribe/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                endpoint: data.endpoint,
                keys: data.keys,
            }),
        }).catch((e) => console.error('Failed to save push subscription:', e));
    }

    function getCSRFToken() {
        const el = document.querySelector('[name=csrfmiddlewaretoken]');
        if (el) return el.value;
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
})();

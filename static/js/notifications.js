/**
 * Heracles Coach — Notification Bell Handler
 *
 * Clicking the bell schedules a push notification in 1 minute
 * via the Service Worker: "Don't forget your workout!"
 */
document.addEventListener('DOMContentLoaded', function () {
    const bellBtn = document.getElementById('notifBell');
    if (!bellBtn) return;

    // Listen for confirmation from the Service Worker
    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'REMINDER_SCHEDULED') {
                showToast(`🔔 Workout reminder set for ${event.data.delay}s from now!`);
            }
        });
    }

    bellBtn.addEventListener('click', function () {
        // Request notification permission if not yet granted
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((perm) => {
                if (perm === 'granted') {
                    scheduleReminder();
                } else {
                    showToast('⚠️ Please allow notifications to receive reminders.');
                }
            });
            return;
        }

        if ('Notification' in window && Notification.permission === 'denied') {
            showToast('⚠️ Notifications are blocked. Enable them in browser settings.');
            return;
        }

        scheduleReminder();
    });

    function scheduleReminder() {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_REMINDER',
                delay: 60, // 1 minute in seconds
                body: "Don't forget your workout! Time to get moving 💪",
            });

            // Visual feedback — animate the bell
            bellBtn.classList.add('bell-ring');
            setTimeout(() => bellBtn.classList.remove('bell-ring'), 1000);

            showToast('🔔 Workout reminder scheduled in 1 minute!');
        } else {
            showToast('⚠️ Service Worker not ready. Refresh and try again.');
        }
    }

    function showToast(text) {
        // Remove any existing toast
        const old = document.querySelector('.alert-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = 'alert-toast success';
        toast.textContent = text;
        toast.onclick = () => toast.remove();
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
});

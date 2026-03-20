/**
 * Heracles Coach — Notification Bell Handler
 *
 * Clicking the bell:
 * 1. Subscribes to Web Push (if not already)
 * 2. Sends request to server to schedule a real push in 30 seconds
 * 3. Push arrives even if browser/tab is closed
 */
document.addEventListener('DOMContentLoaded', function () {
    const bellBtn = document.getElementById('notifBell');
    if (!bellBtn) return;

    function getCSRFToken() {
        const el = document.querySelector('[name=csrfmiddlewaretoken]');
        if (el) return el.value;
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }

    bellBtn.addEventListener('click', async function () {
        // Step 1: ensure push subscription exists
        if (!window.heraclesPush) {
            showToast('⚠️ Push not supported on this browser.');
            return;
        }

        const result = await window.heraclesPush.subscribe();
        if (result.error === 'denied') {
            showToast('⚠️ Notifications blocked. Enable them in browser settings.');
            return;
        }

        // Step 2: ask the server to schedule a real push in 30 seconds
        try {
            const resp = await fetch('/notifications/api/schedule-push/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({
                    delay: 30,
                    title: 'Heracles Coach 🏋️',
                    body: "Don't forget your workout! Time to get moving 💪",
                }),
            });
            const data = await resp.json();

            if (data.status === 'scheduled') {
                bellBtn.classList.add('bell-ring');
                setTimeout(() => bellBtn.classList.remove('bell-ring'), 1000);
                showToast('🔔 Workout reminder in 30 seconds!');
            } else {
                showToast('⚠️ Could not schedule reminder.');
            }
        } catch (e) {
            showToast('⚠️ Connection error. Try again.');
        }
    });

    function showToast(text) {
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

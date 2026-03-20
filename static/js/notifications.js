document.addEventListener('DOMContentLoaded', function () {
    const bellBtn = document.getElementById('notifBell');
    const dropdown = document.getElementById('notifDropdown');
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifList');
    const markAllBtn = document.getElementById('markAllRead');

    function getCSRFToken() {
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }

    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMin = Math.floor((now - date) / 60000);
        if (diffMin < 1) return 'now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `${diffHour}h ago`;
        return date.toLocaleDateString('en-US');
    }

    function getNotifIcon(type) {
        const icons = {
            workout: '🏋️',
            nutrition: '🥗',
            water: '💧',
            general: '🔔',
        };
        return icons[type] || icons.general;
    }

    async function fetchNotifications() {
        try {
            const resp = await fetch('/notifications/api/');
            const data = await resp.json();
            const notifications = data.notifications || [];

            if (notifications.length > 0) {
                if (notifBadge) {
                    notifBadge.textContent = notifications.length;
                    notifBadge.classList.remove('hidden');
                }

                if (notifList) {
                    notifList.innerHTML = notifications.map(n => `
                        <div class="notif-item" data-id="${n.id}">
                            <div class="notif-item-icon ${n.type}">${getNotifIcon(n.type)}</div>
                            <div class="notif-item-content">
                                <div class="notif-item-title">${n.title}</div>
                                <div class="notif-item-text">${n.message}</div>
                                <div class="notif-item-time">${timeAgo(n.created_at)}</div>
                            </div>
                        </div>
                    `).join('');

                    // Click to dismiss
                    notifList.querySelectorAll('.notif-item').forEach(item => {
                        item.addEventListener('click', async function () {
                            const id = this.dataset.id;
                            await fetch(`/notifications/api/${id}/read/`, {
                                method: 'POST',
                                headers: { 'X-CSRFToken': getCSRFToken() },
                            });
                            this.remove();
                            updateBadge();
                        });
                    });
                }

                // Browser notification for the newest
                if (Notification.permission === 'granted') {
                    const latest = notifications[0];
                    new Notification(latest.title, { body: latest.message });
                }
            } else {
                if (notifBadge) notifBadge.classList.add('hidden');
                if (notifList) notifList.innerHTML = '<div class="notif-empty">No new notifications</div>';
            }
        } catch (e) {
            console.error('Failed to fetch notifications:', e);
        }
    }

    function updateBadge() {
        if (!notifList) return;
        const remaining = notifList.querySelectorAll('.notif-item').length;
        if (remaining === 0) {
            if (notifBadge) notifBadge.classList.add('hidden');
            notifList.innerHTML = '<div class="notif-empty">No new notifications</div>';
        } else {
            if (notifBadge) {
                notifBadge.textContent = remaining;
                notifBadge.classList.remove('hidden');
            }
        }
    }

    // Toggle dropdown
    if (bellBtn && dropdown) {
        bellBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target) && e.target !== bellBtn) {
                dropdown.classList.remove('open');
            }
        });
    }

    // Mark all read
    if (markAllBtn) {
        markAllBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            await fetch('/notifications/api/read-all/', {
                method: 'POST',
                headers: { 'X-CSRFToken': getCSRFToken() },
            });
            if (notifBadge) notifBadge.classList.add('hidden');
            if (notifList) notifList.innerHTML = '<div class="notif-empty">No new notifications</div>';
        });
    }


    // Fetch on load and poll every 60s
    fetchNotifications();
    setInterval(fetchNotifications, 60000);
});


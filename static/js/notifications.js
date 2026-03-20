/**
 * Heracles Coach — Notification Panel
 *
 * Bell button opens a panel with 3 notification types:
 * 1) Workout reminder — schedules a push in 30s
 * 2) Poor sleep alert — drops metrics, sends auto-prompt to chat
 * 3) Nutrition alert — drops metrics, sends auto-prompt to chat
 */
document.addEventListener('DOMContentLoaded', function () {
    const bellBtn = document.getElementById('notifBell');
    const panel = document.getElementById('notifPanel');
    const btnWorkout = document.getElementById('notifWorkout');
    const btnSleep = document.getElementById('notifSleep');
    const btnNutrition = document.getElementById('notifNutrition');

    if (!bellBtn || !panel) return;

    function getCSRFToken() {
        const el = document.querySelector('[name=csrfmiddlewaretoken]');
        if (el) return el.value;
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }

    // Toggle panel
    bellBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        bellBtn.classList.add('bell-ring');
        setTimeout(() => bellBtn.classList.remove('bell-ring'), 600);
        panel.classList.toggle('open');
    });

    // Close panel on outside click
    document.addEventListener('click', function (e) {
        if (!panel.contains(e.target) && e.target !== bellBtn) {
            panel.classList.remove('open');
        }
    });

    // --- 1) Workout reminder ---
    btnWorkout.addEventListener('click', async function () {
        panel.classList.remove('open');
        await ensurePushSubscription();
        await schedulePush(30, 'Heracles Coach 🏋️', "Don't forget your workout! Time to get moving 💪");
        showToast('🏋️ Workout reminder in 30 seconds!');
    });

    // --- 2) Poor sleep alert ---
    btnSleep.addEventListener('click', async function () {
        panel.classList.remove('open');
        await ensurePushSubscription();
        await schedulePush(30, 'Heracles Coach 😴', 'Poor sleep detected! Your recovery metrics have dropped.');

        // Drop dashboard metrics to simulate poor sleep
        degradeMetrics('sleep');

        showToast('😴 Sleep alert sent! Metrics updated.');

        // Auto-send prompt to chatbot
        sendAutoPrompt(
            "I've been sleeping poorly the last few days — only about 4-5 hours per night. " +
            "My recovery score dropped and I feel fatigued. What should I do to improve my sleep and recovery?"
        );
    });

    // --- 3) Nutrition alert ---
    btnNutrition.addEventListener('click', async function () {
        panel.classList.remove('open');
        await ensurePushSubscription();
        await schedulePush(30, 'Heracles Coach 🥗', 'Poor nutrition detected! Your biomarkers need attention.');

        // Drop dashboard metrics to simulate poor nutrition
        degradeMetrics('nutrition');

        showToast('🥗 Nutrition alert sent! Metrics updated.');

        // Auto-send prompt to chatbot
        sendAutoPrompt(
            "My recent blood work shows concerning trends — high LDL cholesterol, elevated CRP inflammation marker, " +
            "and low Vitamin D. I think my diet has been poor lately with too much processed food. " +
            "Can you give me nutrition recommendations to improve these biomarkers?"
        );
    });

    // --- Helpers ---

    async function ensurePushSubscription() {
        if (window.heraclesPush) {
            await window.heraclesPush.subscribe();
        }
    }

    async function schedulePush(delay, title, body) {
        try {
            await fetch('/notifications/api/schedule-push/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ delay, title, body }),
            });
        } catch (e) {
            console.error('Failed to schedule push:', e);
        }
    }

    function degradeMetrics(type) {
        if (type === 'sleep') {
            // Drop recovery score
            const recoveryEl = document.querySelector('.circular-progress-value');
            if (recoveryEl) recoveryEl.textContent = '47';

            // Drop sleep hours
            const sleepVal = document.querySelector('.small-metric:nth-child(1) .metric-value');
            if (sleepVal) sleepVal.textContent = '4.2h';

            // Increase strain
            const strainVal = document.querySelector('.small-metric:nth-child(2) .metric-value');
            if (strainVal) strainVal.textContent = '16.8';

            // Update recovery in header
            const statusEl = document.querySelector('.app-header-info .status');
            if (statusEl) {
                statusEl.textContent = '47% recovery';
                statusEl.style.color = '#f87171';
            }

            // Update status banner
            const bannerH4 = document.querySelector('.status-banner h4');
            const bannerP = document.querySelector('.status-banner p');
            if (bannerH4) bannerH4.textContent = 'Recovery low';
            if (bannerP) bannerP.textContent = 'Poor sleep detected — consider a rest day';
            const bannerIcon = document.querySelector('.status-banner .metric-icon');
            if (bannerIcon) {
                bannerIcon.classList.remove('green');
                bannerIcon.classList.add('red');
            }

            // Update SVG progress ring
            updateRecoveryRing(47);

        } else if (type === 'nutrition') {
            // Drop recovery moderately
            const recoveryEl = document.querySelector('.circular-progress-value');
            if (recoveryEl) recoveryEl.textContent = '61';

            const statusEl = document.querySelector('.app-header-info .status');
            if (statusEl) {
                statusEl.textContent = '61% recovery';
                statusEl.style.color = '#fbbf24';
            }

            // Update status banner
            const bannerH4 = document.querySelector('.status-banner h4');
            const bannerP = document.querySelector('.status-banner p');
            if (bannerH4) bannerH4.textContent = 'Nutrition attention needed';
            if (bannerP) bannerP.textContent = 'Poor diet detected — biomarkers declining';
            const bannerIcon = document.querySelector('.status-banner .metric-icon');
            if (bannerIcon) {
                bannerIcon.classList.remove('green');
                bannerIcon.classList.add('red');
            }

            updateRecoveryRing(61);

            // Degrade biomarkers
            const bioCards = document.querySelectorAll('.biomarker-card');
            bioCards.forEach(card => {
                const name = card.querySelector('.biomarker-name');
                const value = card.querySelector('.biomarker-value');
                const status = card.querySelector('.biomarker-status');
                if (!name || !value || !status) return;

                const n = name.textContent.trim();
                if (n === 'LDL Cholesterol') {
                    value.innerHTML = '4.1 <small>mmol/L</small>';
                    status.className = 'biomarker-status high';
                    status.textContent = 'high';
                } else if (n === 'CRP (hs)') {
                    value.innerHTML = '5.2 <small>mg/L</small>';
                    status.className = 'biomarker-status high';
                    status.textContent = 'high';
                } else if (n === 'Vitamin D') {
                    value.innerHTML = '28 <small>nmol/L</small>';
                    status.className = 'biomarker-status low';
                    status.textContent = 'low';
                } else if (n === 'HbA1c') {
                    value.innerHTML = '6.1 <small>%</small>';
                    status.className = 'biomarker-status high';
                    status.textContent = 'high';
                }
            });
        }
    }

    function updateRecoveryRing(pct) {
        const circle = document.querySelector('.circular-progress svg circle:last-child');
        if (!circle) return;
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - pct / 100);
        circle.setAttribute('stroke-dashoffset', offset.toFixed(1));
        // Change color to red if low
        if (pct < 60) {
            circle.setAttribute('stroke', '#ef4444');
        } else if (pct < 80) {
            circle.setAttribute('stroke', '#fbbf24');
        }
    }

    function sendAutoPrompt(text) {
        // Scroll to chat section
        const chatSection = document.querySelector('.chat-section');
        if (chatSection) {
            chatSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Use the global sendMessage from chat.js if available,
        // otherwise simulate by filling input and submitting form
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            const chatForm = document.getElementById('chatForm');
            if (chatInput && chatForm) {
                chatInput.value = text;
                chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        }, 800);
    }

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

/**
 * Heracles Coach — Notification Panel
 *
 * Flow:
 * 1. User clicks notification button → schedules push, stores alert type in localStorage
 * 2. User leaves the app
 * 3. Push arrives in 30s
 * 4. User clicks push → returns to app
 * 5. On return: metrics degrade + auto-message sent to chatbot
 */
document.addEventListener('DOMContentLoaded', function () {
    const bellBtn = document.getElementById('notifBell');
    const panel = document.getElementById('notifPanel');
    const btnWorkout = document.getElementById('notifWorkout');
    const btnSleep = document.getElementById('notifSleep');
    const btnNutrition = document.getElementById('notifNutrition');

    if (!bellBtn || !panel) return;

    const PENDING_KEY = 'heracles_pending_alert';

    function getCSRFToken() {
        const el = document.querySelector('[name=csrfmiddlewaretoken]');
        if (el) return el.value;
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }

    // ─── Check on page load if there's a pending alert ───
    checkPendingAlert();

    // Also check when tab becomes visible again (user returned)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            checkPendingAlert();
        }
    });

    // ─── Toggle panel ───
    bellBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        bellBtn.classList.add('bell-ring');
        setTimeout(() => bellBtn.classList.remove('bell-ring'), 600);
        panel.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
        if (!panel.contains(e.target) && e.target !== bellBtn) {
            panel.classList.remove('open');
        }
    });

    // ─── 1) Workout reminder ───
    btnWorkout.addEventListener('click', async function () {
        panel.classList.remove('open');
        await ensurePushSubscription();
        // Store pending alert — on return, just show toast (no metric change)
        localStorage.setItem(PENDING_KEY, JSON.stringify({ type: 'workout', ts: Date.now() }));
        await schedulePush(30, 'Heracles Coach 🏋️', "Don't forget your workout! Time to get moving 💪");
        showToast('🏋️ Workout reminder scheduled — you\'ll get a push in 30s');
    });

    // ─── 2) Poor sleep alert ───
    btnSleep.addEventListener('click', async function () {
        panel.classList.remove('open');
        await ensurePushSubscription();
        // Store pending alert — metrics + chat will fire when user RETURNS
        localStorage.setItem(PENDING_KEY, JSON.stringify({ type: 'sleep', ts: Date.now() }));
        await schedulePush(30, 'Heracles Coach 😴', 'Poor sleep detected! Your recovery metrics have dropped. Tap to see details.');
        showToast('😴 Sleep alert scheduled — leave the app, push arrives in 30s');
    });

    // ─── 3) Nutrition alert ───
    btnNutrition.addEventListener('click', async function () {
        panel.classList.remove('open');
        await ensurePushSubscription();
        // Store pending alert — metrics + chat will fire when user RETURNS
        localStorage.setItem(PENDING_KEY, JSON.stringify({ type: 'nutrition', ts: Date.now() }));
        await schedulePush(30, 'Heracles Coach 🥗', 'Poor nutrition detected! Your biomarkers need attention. Tap to see details.');
        showToast('🥗 Nutrition alert scheduled — leave the app, push arrives in 30s');
    });

    // ═══════════════════════════════════════════
    //  CHECK & APPLY PENDING ALERT ON RETURN
    // ═══════════════════════════════════════════
    function checkPendingAlert() {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw) return;

        let alert;
        try { alert = JSON.parse(raw); } catch (e) { localStorage.removeItem(PENDING_KEY); return; }

        // Only apply if at least 10 seconds have passed (user actually left and came back)
        if (Date.now() - alert.ts < 10000) return;

        // Remove so it doesn't fire again
        localStorage.removeItem(PENDING_KEY);

        if (alert.type === 'workout') {
            showToast('🏋️ Welcome back! Time for your workout!');
        } else if (alert.type === 'sleep') {
            applyAlertOnReturn('sleep');
        } else if (alert.type === 'nutrition') {
            applyAlertOnReturn('nutrition');
        }
    }

    function applyAlertOnReturn(type) {
        // Step 1: Degrade metrics visually
        degradeMetrics(type);

        // Step 2: Show toast about changed metrics
        if (type === 'sleep') {
            showToast('😴 Your metrics changed while you were away — poor sleep detected');
        } else {
            showToast('🥗 Your metrics changed while you were away — nutrition issues detected');
        }

        // Step 3: After short delay, scroll to chat and send auto-prompt
        setTimeout(() => {
            if (type === 'sleep') {
                sendAutoPrompt(
                    "I've been sleeping poorly the last few days — only about 4-5 hours per night. " +
                    "My recovery score dropped to 47% and I feel fatigued. " +
                    "What should I do to improve my sleep and recovery?"
                );
            } else {
                sendAutoPrompt(
                    "My recent blood work shows concerning trends — high LDL cholesterol at 4.1 mmol/L, " +
                    "elevated CRP inflammation marker at 5.2 mg/L, and low Vitamin D at 28 nmol/L. " +
                    "I think my diet has been poor lately. " +
                    "Can you give me nutrition recommendations to improve these biomarkers?"
                );
            }
        }, 1500);
    }

    // ═══════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════

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
            // Recovery score
            const recoveryEl = document.querySelector('.circular-progress-value');
            if (recoveryEl) recoveryEl.textContent = '47';

            // Sleep hours
            const sleepVal = document.querySelector('.small-metric:nth-child(1) .metric-value');
            if (sleepVal) sleepVal.textContent = '4.2h';

            // Strain
            const strainVal = document.querySelector('.small-metric:nth-child(2) .metric-value');
            if (strainVal) strainVal.textContent = '16.8';

            // Header status
            const statusEl = document.querySelector('.app-header-info .status');
            if (statusEl) {
                statusEl.textContent = '47% recovery';
                statusEl.style.color = '#f87171';
            }

            // Status banner
            const bannerH4 = document.querySelector('.status-banner h4');
            const bannerP = document.querySelector('.status-banner p');
            if (bannerH4) bannerH4.textContent = 'Recovery low';
            if (bannerP) bannerP.textContent = 'Poor sleep detected — consider a rest day';
            const bannerIcon = document.querySelector('.status-banner .metric-icon');
            if (bannerIcon) {
                bannerIcon.classList.remove('green');
                bannerIcon.classList.add('red');
            }

            updateRecoveryRing(47);

        } else if (type === 'nutrition') {
            // Recovery
            const recoveryEl = document.querySelector('.circular-progress-value');
            if (recoveryEl) recoveryEl.textContent = '61';

            const statusEl = document.querySelector('.app-header-info .status');
            if (statusEl) {
                statusEl.textContent = '61% recovery';
                statusEl.style.color = '#fbbf24';
            }

            // Status banner
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
        if (pct < 60) {
            circle.setAttribute('stroke', '#ef4444');
        } else if (pct < 80) {
            circle.setAttribute('stroke', '#fbbf24');
        }
    }

    function sendAutoPrompt(text) {
        const chatSection = document.querySelector('.chat-section');
        if (chatSection) {
            chatSection.scrollIntoView({ behavior: 'smooth' });
        }

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
        setTimeout(() => toast.remove(), 5000);
    }
});

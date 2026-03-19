document.addEventListener('DOMContentLoaded', function () {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    const sendBtn = document.getElementById('sendBtn');

    let conversationHistory = [];

    function getCSRFToken() {
        const el = document.querySelector('[name=csrfmiddlewaretoken]');
        if (el) return el.value;
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatResponse(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    function addMessage(text, isUser) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        msgDiv.innerHTML = `<div class="chat-bubble">${isUser ? escapeHtml(text) : formatResponse(text)}</div>`;
        chatMessages.insertBefore(msgDiv, typingIndicator);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function setLoading(loading) {
        if (typingIndicator) {
            typingIndicator.classList.toggle('visible', loading);
        }
        if (sendBtn) sendBtn.disabled = loading;
        if (chatInput) chatInput.disabled = loading;
        scrollToBottom();
    }

    async function sendMessage(message) {
        if (!message.trim()) return;

        addMessage(message, true);
        if (chatInput) chatInput.value = '';

        conversationHistory.push({ role: 'user', content: message });
        setLoading(true);

        try {
            const response = await fetch('/chat/api/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({
                    message: message,
                    history: conversationHistory.slice(-10),
                }),
            });

            const data = await response.json();

            if (data.response) {
                addMessage(data.response, false);
                conversationHistory.push({ role: 'assistant', content: data.response });
            } else if (data.error) {
                addMessage('⚠️ ' + data.error, false);
            }
        } catch (error) {
            addMessage('⚠️ Ошибка подключения к серверу. Попробуйте позже.', false);
        } finally {
            setLoading(false);
            if (chatInput) chatInput.focus();
        }
    }

    // Form submit
    if (chatForm) {
        chatForm.addEventListener('submit', function (e) {
            e.preventDefault();
            sendMessage(chatInput.value);
        });
    }

    // Quick suggestions
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            sendMessage(this.dataset.q || this.textContent.trim());
        });
    });

    // Focus input
    if (chatInput) chatInput.focus();
});


import json
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from .ai_client import query_huggingface


@login_required
@ensure_csrf_cookie
def chat_view(request):
    """Render the chat page."""
    return render(request, 'chatbot/chat.html')


@login_required
def chat_api(request):
    """API endpoint for chat messages."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        conversation_history = data.get('history', [])
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if not user_message:
        return JsonResponse({'error': 'Empty message'}, status=400)

    ai_response = query_huggingface(user_message, conversation_history)

    return JsonResponse({
        'response': ai_response,
        'status': 'ok',
    })


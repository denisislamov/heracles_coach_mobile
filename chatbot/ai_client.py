import requests
from django.conf import settings


SYSTEM_PROMPT = (
    "You are Heracles Coach, a professional AI health and fitness coach. "
    "You help users with questions about nutrition, workouts, sleep, "
    "recovery, and overall well-being. Answer concisely and to the point. "
    "Use emojis for expressiveness. "
    "If the question is not related to health, politely redirect the conversation to health topics."
)

API_URL = "https://router.huggingface.co/v1/chat/completions"
MODEL = "Qwen/Qwen2.5-7B-Instruct"


def query_huggingface(user_message: str, conversation_history: list = None) -> str:
    """
    Send a message to HuggingFace Inference API using the new
    OpenAI-compatible chat completions endpoint.
    """
    api_token = settings.HUGGINGFACE_API_TOKEN
    if not api_token:
        return ("⚠️ HuggingFace API token is not configured. "
                "Add HUGGINGFACE_API_TOKEN to your environment variables.")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if conversation_history:
        for msg in conversation_history[-10:]:
            messages.append(msg)

    messages.append({"role": "user", "content": user_message})

    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": 500,
        "temperature": 0.7,
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()

        choices = result.get("choices", [])
        if choices:
            content = choices[0].get("message", {}).get("content", "").strip()
            return content if content else "Sorry, couldn't get a response. Please try again."

        return "Sorry, couldn't get a response. Please try again."

    except requests.exceptions.Timeout:
        return "⏳ Model is loading, please try again in 20-30 seconds..."
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 503:
            return "⏳ Model is loading, please try again in 20-30 seconds..."
        if e.response.status_code == 429:
            return "⏳ Rate limit reached. Please wait a moment and try again..."
        return f"API error: {e.response.status_code}"
    except Exception as e:
        return f"An error occurred: {str(e)}"

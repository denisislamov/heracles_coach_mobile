import requests
from django.conf import settings


SYSTEM_PROMPT = (
    "You are Heracles Coach, a professional AI health and fitness coach. "
    "You help users with questions about nutrition, workouts, sleep, "
    "recovery, and overall well-being. Answer concisely and to the point. "
    "Use emojis for expressiveness. "
    "If the question is not related to health, politely redirect the conversation to health topics."
)


def query_huggingface(user_message: str, conversation_history: list = None) -> str:
    """
    Send a message to HuggingFace Inference API using a free model.
    Uses mistralai/Mistral-7B-Instruct-v0.3.
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

    API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": _format_messages_for_mistral(messages),
        "parameters": {
            "max_new_tokens": 500,
            "temperature": 0.7,
            "return_full_text": False,
        },
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()

        if isinstance(result, list) and len(result) > 0:
            generated = result[0].get('generated_text', '').strip()
            if '[/INST]' in generated:
                generated = generated.split('[/INST]')[-1].strip()
            return generated if generated else "Sorry, couldn't get a response. Please try again."

        return "Sorry, couldn't get a response. Please try again."

    except requests.exceptions.Timeout:
        return "⏳ Model is loading, please try again in 20-30 seconds..."
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 503:
            return "⏳ Model is loading, please try again in 20-30 seconds..."
        return f"API error: {e.response.status_code}"
    except Exception as e:
        return f"An error occurred: {str(e)}"


def _format_messages_for_mistral(messages: list) -> str:
    """Format messages into Mistral instruction format."""
    formatted = ""
    system_msg = ""

    for msg in messages:
        if msg["role"] == "system":
            system_msg = msg["content"]
        elif msg["role"] == "user":
            content = msg["content"]
            if system_msg:
                content = f"{system_msg}\n\n{content}"
                system_msg = ""
            formatted += f"<s>[INST] {content} [/INST]"
        elif msg["role"] == "assistant":
            formatted += f" {msg['content']}</s>"

    return formatted


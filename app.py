from flask import Flask, render_template, request, jsonify
import requests
import re
import os

app = Flask(__name__)

# Load API key securely from environment variable
API_KEY = os.getenv("API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Keywords that indicate insurance-related topics
INSURANCE_KEYWORDS = [
    "insurance", "policy", "premium", "coverage", "claim", "deductible",
    "beneficiary", "underwriting", "health insurance", "life insurance",
    "auto insurance", "home insurance", "financial protection", "risk"
]

# Basic phrases with minimal replies
BASIC_RESPONSES = {
    "hi": "Hello!",
    "hello": "Hi there!",
    "hey": "Hey!",
    "thanks": "You're welcome!",
    "thank you": "Glad to help!",
    "bye": "Goodbye!",
    "goodbye": "Take care!",
    "ok": "Alright.",
    "okay": "Sure.",
    "cool": "😎",
    "great": "Awesome!"
}

def is_insurance_related(user_input):
    user_input_lower = user_input.lower()
    return any(keyword in user_input_lower for keyword in INSURANCE_KEYWORDS)

def is_basic_phrase(user_input):
    return user_input.lower().strip() in BASIC_RESPONSES

def query_openrouter(user_input):
    payload = {
        "model": "mistralai/mistral-small-3.2-24b-instruct:free, deepseek/deepseek-chat-v3.1:free",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a knowledgeable and friendly Insurance AI Agent. "
                    "Provide clear, concise, and helpful answers about insurance policies, claims, coverage, and financial protection. "
                    "Use structured formatting when helpful, and avoid jargon unless explained."
                )
            },
            {"role": "user", "content": user_input}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]

        # Convert markdown-style bold to HTML <strong>
        content = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", content)

        return content
    except Exception as e:
        print("Error:", e)
        return "Sorry, the Insurance AI Agent couldn't respond. Please check your internet connection."

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "").strip()

    if is_basic_phrase(user_input):
        reply = BASIC_RESPONSES[user_input.lower()]
    elif is_insurance_related(user_input):
        reply = query_openrouter(user_input)
    else:
        reply = "I'm here to help with insurance-related questions only."

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run()
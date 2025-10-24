from flask import Flask, render_template, request, jsonify
import requests
import re
import os

app = Flask(__name__)

# Load API key securely from environment variable
API_KEY = os.getenv("OPENROUTER_API_KEY")  # Set this in your environment
API_URL = "https://openrouter.ai/api/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}" if API_KEY else "",
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
    "hi": "Hello! How can I assist you with your insurance today?",
    "hello": "Hi there! Need help with a policy or claim?",
    "hey": "Hey! I'm here to help with anything insurance-related.",
    "thanks": "You're welcome! Let me know if you have more questions about your coverage.",
    "thank you": "Glad to help! Insurance can be tricky—I'm here to make it easier.",
    "bye": "Goodbye! Stay covered and safe.",
    "goodbye": "Take care! Reach out anytime for insurance support.",
    "ok": "Got it. Let me know if you need help with your policy.",
    "okay": "Sure thing. Happy to clarify anything about your insurance.",
    "cool": "Glad you think so! Insurance peace of mind is always cool 😎",
    "great": "Awesome! Let’s make sure your coverage is just as great.",
    "claim": "To file a claim, I’ll need a few details like your policy number and incident date.",
    "policy": "Your insurance policy outlines what’s covered and what’s not. Want to review it together?",
    "premium": "Premiums are the payments you make to keep your policy active. Want to check your current rate?",
    "coverage": "Coverage refers to the protection your policy offers. I can help you understand what’s included.",
    "deductible": "A deductible is the amount you pay out-of-pocket before your insurance kicks in.",
    "renewal": "Insurance policies often renew annually. I can help you check your renewal date or options.",
    "beneficiary": "A beneficiary is the person who receives the payout from a life insurance policy.",
    "grace period": "The grace period is the time after your premium due date when your policy stays active without payment.",
    "exclusions": "Exclusions are situations or items not covered by your policy. Want to go over them?"
}

def is_insurance_related(user_input):
    return any(keyword in user_input.lower() for keyword in INSURANCE_KEYWORDS)

def is_basic_phrase(user_input):
    return user_input.lower().strip() in BASIC_RESPONSES

def query_openrouter(user_input):
    if not API_KEY:
        return "API key missing. Please set OPENROUTER_API_KEY in your environment."

    payload = {
        "model": "mistralai/mistral-small-3.2-24b-instruct:free",
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
        content = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", content)
        return content
    except Exception as e:
        print("Error querying OpenRouter:", e)
        return "Sorry, the Insurance AI Agent couldn't respond. Please try again later."

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("message", "").strip()

    if not user_input:
        return jsonify({"reply": "Please enter a message."})

    if is_basic_phrase(user_input):
        reply = BASIC_RESPONSES[user_input.lower()]
    elif is_insurance_related(user_input):
        reply = query_openrouter(user_input)
    else:
        reply = "I'm here to help with insurance-related questions only."

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)
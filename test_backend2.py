import requests

url = "http://localhost:8000/chat"
payload = {
    "message": "hi",
    "models": ["ollama:qwen3.6:27b"],
    "agent_id": "auto",
    "context": {}
}

try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

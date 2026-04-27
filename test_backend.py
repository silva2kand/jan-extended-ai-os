import requests
import json

url = "http://localhost:8000/chat"
payload = {
    "message": "hi",
    "models": ["ollama:llama3.1"],
    "agent_id": "auto",
    "context": {}
}

try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

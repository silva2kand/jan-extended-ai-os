import requests

# Test Ollama directly with the available model
payload = {
    "model": "qwen3.6:27b",
    "messages": [{"role": "user", "content": "hi"}],
    "stream": False
}

try:
    response = requests.post("http://localhost:11434/api/chat", json=payload, timeout=30)
    print(f"Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"Response: {data.get('message', {}).get('content', 'No content')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")

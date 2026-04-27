import requests

# Test Ollama with the smaller model
payload = {
    "model": "lfm2.5-thinking:latest",
    "messages": [{"role": "user", "content": "hi"}],
    "stream": False
}

try:
    response = requests.post("http://localhost:11434/api/chat", json=payload, timeout=60)
    print(f"Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"Response: {data.get('message', {}).get('content', 'No content')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")

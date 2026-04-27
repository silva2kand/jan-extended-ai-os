import requests

# Check if Ollama is running
try:
    response = requests.get("http://localhost:11434/api/tags", timeout=2)
    print(f"Ollama Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print("Available models:")
        for model in data.get("models", []):
            print(f"  - {model['name']}")
    else:
        print("Ollama returned error")
except Exception as e:
    print(f"Ollama not running or not accessible: {e}")

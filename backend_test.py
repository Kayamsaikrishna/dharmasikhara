import requests
import json

# Test the legal assistant endpoint
url = "http://localhost:5001/api/ai/legal-assistant"
headers = {
    "Content-Type": "application/json"
}
data = {
    "query": "hello how to deal with civil cases in india?"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
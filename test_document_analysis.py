import requests
import json

# Test the document analysis endpoint (test version without authentication)
url = "http://localhost:5000/api/ai/analyze-document-test"

# Create a test document with a reasonable size
test_document = {
    "documentText": "This is a test legal document. It contains some legal terms and concepts that would be analyzed by the AI system. The document is not too large to exceed the payload limit."
}

# Send the request without authentication to test the endpoint
try:
    response = requests.post(url, json=test_document)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print("JSON Response:")
            print(json.dumps(data, indent=2))
        except json.JSONDecodeError:
            print("Response is not valid JSON")
    else:
        print(f"Error: {response.status_code} - {response.text}")
        
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
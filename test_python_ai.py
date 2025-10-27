import json
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Test input
test_input = {
    "query": "What are the key provisions for bail in India?"
}

# Send to stdin as the Python script expects
print(json.dumps(test_input))
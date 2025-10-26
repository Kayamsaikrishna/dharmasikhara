import sys
import json

# Test data
test_data = {
    "query": "What are the key provisions for bail in criminal cases under Indian law?",
    "query_type": "legal_assistant"
}

# Convert to JSON and send to stdin
json_data = json.dumps(test_data)
sys.stdout.write(json_data)
sys.stdout.flush()
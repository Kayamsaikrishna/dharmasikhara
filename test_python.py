import sys
import json
import torch
import numpy as np

# Add the backend directory to the path so we can import the legal_ai module
sys.path.append('backend')

# Import the function we want to test
from legal_ai import get_legal_assistant_response

# Test queries
test_queries = [
    "how to deal with civil cases in india?",
    "how to work on civil cases"
]

# Test each query
for i, query in enumerate(test_queries):
    print(f"\n--- Test {i+1}: '{query}' ---")
    result = get_legal_assistant_response(query)
    if "response" in result:
        # Print first 300 characters of the response
        response_text = result["response"]
        short_response = response_text[:300] + "..." if len(response_text) > 300 else response_text
        print(f"Response: {short_response}")
    else:
        print(f"Error: {result}")
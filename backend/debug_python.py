import sys
import json

# Read input from stdin
input_data = sys.stdin.read()
print("Input data length:", len(input_data))

try:
    # Parse the JSON input
    data = json.loads(input_data)
    print("JSON parsing successful")
    document_text = data.get("document_text", "")
    query = data.get("query", "")
    
    print("Document text length:", len(document_text))
    print("Query length:", len(query))
    
    if query:
        print("Processing query:", query[:100])
    elif document_text:
        print("Processing document text:", document_text[:100])
    else:
        print("No query or document text provided")
        
except json.JSONDecodeError as e:
    print("JSON decode error:", str(e))
    print("Input data:", input_data[:200])
except Exception as e:
    print("Unexpected error:", str(e))
import json
import subprocess
import sys

# Test input for document analysis
test_input = {
    "document_text": "This is a contract between Party A and Party B for the sale of goods. The terms include payment of ₹50,000 within 30 days of signing.",
    "query_type": "document_analysis"
}

# Run the Python script
try:
    result = subprocess.run([
        sys.executable, 
        'd:\\law\\backend\\legal_ai.py'
    ], 
    input=json.dumps(test_input),
    text=True,
    capture_output=True,
    timeout=60
    )
    
    print("STDOUT:")
    print(result.stdout)
    
    print("\nSTDERR:")
    print(result.stderr)
    
    print("\nReturn code:", result.returncode)
    
    if result.returncode == 0:
        try:
            response = json.loads(result.stdout)
            print("\nParsed response:")
            print(json.dumps(response, indent=2))
        except json.JSONDecodeError:
            print("\nCould not parse JSON response")
    else:
        print("\nScript failed to run successfully")
        
except subprocess.TimeoutExpired:
    print("Test timed out - the model might still be loading")
except Exception as e:
    print(f"Error running test: {e}")
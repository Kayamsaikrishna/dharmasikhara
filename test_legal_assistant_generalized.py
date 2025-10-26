import json
import subprocess
import sys

# Test input for the Legal Assistant
test_input = {
    "query": "What are the key provisions for bail in criminal cases under Indian law?",
    "query_type": "legal_assistant"
}

# Write test input to a temporary file
with open('test_input.json', 'w') as f:
    json.dump(test_input, f)

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
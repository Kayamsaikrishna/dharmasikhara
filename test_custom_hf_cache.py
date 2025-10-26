import json
import subprocess
import sys
import os

# Test with a custom HF cache directory (this directory doesn't need to exist for the test)
custom_hf_cache = "D:\\custom_hf_cache"
os.environ['HF_HOME'] = custom_hf_cache

# Test input for the Legal Assistant
test_input = {
    "query": "What are the key provisions for bail in criminal cases under Indian law?",
    "query_type": "legal_assistant"
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
    timeout=30,
    env={**os.environ, 'HF_HOME': custom_hf_cache}  # Pass the custom environment
    )
    
    print("STDOUT:")
    print(result.stdout)
    
    print("\nSTDERR:")
    print(result.stderr)
    
    print("\nReturn code:", result.returncode)
        
except Exception as e:
    print(f"Error running test: {e}")
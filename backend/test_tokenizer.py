import sys
import json
import os
from transformers import AutoTokenizer, LlamaForCausalLM
import torch

# Check if the model path exists and point to the correct snapshot
model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'InLegalLLaMA')

if not os.path.exists(model_path):
    print(json.dumps({"error": f"Model path does not exist: {model_path}"}))
    sys.exit(1)

try:
    # Load the tokenizer and model
    # Suppress loading messages by redirecting stderr
    import sys
    original_stderr = sys.stderr
    sys.stderr = open(os.devnull, 'w')
    
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = LlamaForCausalLM.from_pretrained(model_path)
    
    # Restore stderr
    sys.stderr.close()
    sys.stderr = original_stderr
except Exception as e:
    print(json.dumps({"error": f"Error loading model: {str(e)}"}))
    sys.exit(1)

# Test with a sample text
test_text = "This is a test document with some legal terms in it."

print("Testing tokenizer with short text...")
try:
    inputs = tokenizer(
        test_text, 
        return_tensors="pt", 
        truncation=True, 
        padding=True, 
        max_length=512,
        return_overflowing_tokens=False
    )
    print("Tokenizer test successful!")
    print("Input IDs shape:", inputs['input_ids'].shape)
except Exception as e:
    print(f"Tokenizer test failed: {str(e)}")

# Test with a longer text
long_text = "This is a longer test document. " * 1000  # About 30,000 characters

print("\nTesting tokenizer with long text...")
try:
    inputs = tokenizer(
        long_text, 
        return_tensors="pt", 
        truncation=True, 
        padding=True, 
        max_length=512,
        return_overflowing_tokens=False
    )
    print("Long text tokenizer test successful!")
    print("Input IDs shape:", inputs['input_ids'].shape)
except Exception as e:
    print(f"Long text tokenizer test failed: {str(e)}")

print("\nTest completed.")
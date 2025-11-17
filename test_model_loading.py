import sys
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Use the local InLegalLLaMA model directory
model_path = os.path.join(os.path.dirname(__file__), 'models', 'InLegalLLaMA')

print(f"Model path: {model_path}")
print(f"Model path exists: {os.path.exists(model_path)}")

if os.path.exists(model_path):
    print("Contents of model directory:")
    for item in os.listdir(model_path):
        print(f"  {item}")

try:
    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    print("Tokenizer loaded successfully")
    
    # Add padding token if it doesn't exist
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        print("Added padding token")
    
    print("Loading model with optimizations...")
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True,
        device_map="auto"
    )
    print("Model loaded successfully!")
    
    # Test the model with a simple prompt
    prompt = "Explain bail provisions in Indian law."
    inputs = tokenizer(prompt, return_tensors="pt")
    
    print("Generating response...")
    with torch.no_grad():
        outputs = model.generate(**inputs, max_length=200, num_return_sequences=1)
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"Response: {response}")
    
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Use the local InLegalLLaMA model directory
model_path = os.path.join(os.path.dirname(__file__), 'models', 'InLegalLLaMA')

print(f"Model path: {model_path}")
print(f"CUDA available: {torch.cuda.is_available()}")

try:
    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    print("Tokenizer loaded successfully")
    
    # Add padding token if it doesn't exist
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        print("Added padding token")
    
    print("Loading model with maximum optimizations...")
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True,
        device_map="auto",
        load_in_8bit=True,
        max_memory={0: "8GiB", "cpu": "16GiB"},
        offload_folder="./offload"
    )
    print("Model loaded successfully!")
    
    # Test with a simple prompt
    prompt = "Explain bail provisions under CrPC."
    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True).to("cuda")
    
    print("Generating response...")
    with torch.no_grad():
        outputs = model.generate(**inputs, max_length=256, num_return_sequences=1, do_sample=True, temperature=0.7)
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"Response: {response}")
    
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
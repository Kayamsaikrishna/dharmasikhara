import sys
import os
import json

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_path)

print("Testing Legal Assistant Functions")
print("=" * 40)

try:
    # Import the transformers and torch libraries
    from transformers import AutoTokenizer, AutoModel
    import torch
    import numpy as np
    
    print("Libraries imported successfully")
    
    # Check if the model path exists
    model_path = r"C:\Users\ASUS\.cache\huggingface\hub\models--law-ai--InCaseLawBERT"
    if not os.path.exists(model_path):
        print(f"Model path does not exist: {model_path}")
    else:
        print("Model path exists")
        
        # Try to import the legal AI module
        import backend.legal_ai as legal_ai
        
        print("Legal AI module imported successfully")
        
        # Test the get_legal_assistant_response function
        test_query = "What are my rights if I'm arrested for a criminal offense?"
        print(f"\nTest Query: {test_query}")
        
        result = legal_ai.get_legal_assistant_response(test_query)
        print(f"Result: {json.dumps(result, indent=2)}")
        
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
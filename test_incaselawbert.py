import sys
import json
import os
from transformers import AutoTokenizer, AutoModel
import torch

# Test the InCaseLawBERT model
def test_incaselawbert():
    try:
        # Model path
        model_path = r"C:\Users\ASUS\.cache\huggingface\hub\models--law-ai--InCaseLawBERT\snapshots\7f2c2a0c1ff4149e8c4a8c79ee9f24757ad5dacd"
        
        if not os.path.exists(model_path):
            print(f"Model path does not exist: {model_path}")
            return False
            
        print("Loading tokenizer and model...")
        
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModel.from_pretrained(model_path)
        
        print("Model loaded successfully!")
        
        # Test with a legal query
        test_query = "What are the key provisions for bail in criminal cases under Indian law?"
        
        print(f"Testing with query: {test_query}")
        
        # Tokenize the input
        inputs = tokenizer(
            test_query,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=512
        )
        
        print("Input tokenized successfully!")
        
        # Get model outputs
        with torch.no_grad():
            outputs = model(**inputs)
        
        print("Model inference completed successfully!")
        print(f"Output shape: {outputs.last_hidden_state.shape}")
        
        # Test document analysis
        test_document = """
        IN THE COURT OF [MAGISTRATE NAME]
        [COURT NAME AND ADDRESS]
        
        BEFORE: [MAGISTRATE NAME]
        
        [APPLICANT NAME]
        Vs.
        STATE OF [STATE NAME]
        
        BAIL APPLICATION UNDER SECTION 439 CrPC
        
        The applicant respectfully submits as follows:
        
        1. That the applicant is [details about the applicant]
        
        2. That the applicant has been arrested in [case details]
        
        3. That the applicant is entitled to bail on the following grounds:
           - [Ground 1]
           - [Ground 2]
           - [Ground 3]
        
        PRAYER:
        
        It is respectfully prayed that this Hon'ble Court may be pleased to grant bail to the applicant.
        
        Date: [DATE]
        Place: [PLACE]
        
        [APPLICANT NAME]
        [ADVOCATE NAME]
        [ADVOCATE REGISTRATION NUMBER]
        """
        
        print("\nTesting document analysis...")
        
        # Tokenize the document
        doc_inputs = tokenizer(
            test_document,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=512
        )
        
        print("Document tokenized successfully!")
        
        # Get model outputs for document
        with torch.no_grad():
            doc_outputs = model(**doc_inputs)
        
        print("Document analysis completed successfully!")
        print(f"Document output shape: {doc_outputs.last_hidden_state.shape}")
        
        return True
        
    except Exception as e:
        print(f"Error testing InCaseLawBERT: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing InCaseLawBERT model...")
    success = test_incaselawbert()
    
    if success:
        print("\nInCaseLawBERT model test completed successfully!")
    else:
        print("\nInCaseLawBERT model test failed!")
        sys.exit(1)
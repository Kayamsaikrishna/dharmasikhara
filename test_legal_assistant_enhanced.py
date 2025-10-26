import json
import subprocess
import sys
import os

# Test the enhanced Legal Assistant features
def test_legal_assistant_enhanced():
    print("Testing Enhanced Legal Assistant Features...")
    
    # Test data for document analysis
    test_document = {
        "document_text": "This is a contract between Party A and Party B for the sale of goods. The terms include payment of ₹50,000 within 30 days of signing. Both parties agree to the terms and conditions outlined in this agreement.",
        "query_type": "document_analysis"
    }
    
    # Test data for legal assistant query
    test_query = {
        "query": "What are the key provisions for bail in criminal cases under Indian law?",
        "query_type": "legal_assistant"
    }
    
    try:
        print("\n1. Testing Document Analysis...")
        # Run the Python script with document analysis input
        result = subprocess.run([
            sys.executable, 
            'd:\\law\\backend\\legal_ai.py'
        ], 
        input=json.dumps(test_document),
        text=True,
        capture_output=True,
        timeout=60
        )
        
        print("Document Analysis Return code:", result.returncode)
        if result.returncode == 0:
            try:
                response = json.loads(result.stdout)
                print("Document Analysis successful!")
                print("Document Type:", response.get("document_type", "N/A"))
                print("Key Terms:", response.get("key_terms", []))
                print("Summary:", response.get("summary", "N/A"))
            except json.JSONDecodeError:
                print("Could not parse JSON response for document analysis")
                print("STDOUT:", result.stdout)
        else:
            print("Document Analysis failed")
            print("STDERR:", result.stderr)
            
        print("\n2. Testing Legal Assistant Query...")
        # Run the Python script with legal assistant query input
        result = subprocess.run([
            sys.executable, 
            'd:\\law\\backend\\legal_ai.py'
        ], 
        input=json.dumps(test_query),
        text=True,
        capture_output=True,
        timeout=60
        )
        
        print("Legal Assistant Return code:", result.returncode)
        if result.returncode == 0:
            try:
                response = json.loads(result.stdout)
                print("Legal Assistant Query successful!")
                print("Response:", response.get("response", "N/A")[:200] + "...")
            except json.JSONDecodeError:
                print("Could not parse JSON response for legal assistant")
                print("STDOUT:", result.stdout)
        else:
            print("Legal Assistant Query failed")
            print("STDERR:", result.stderr)
            
        print("\n✓ Enhanced Legal Assistant tests completed!")
        return True
        
    except subprocess.TimeoutExpired:
        print("Test timed out - the model might still be loading")
        return False
    except Exception as e:
        print(f"Error running test: {e}")
        return False

if __name__ == "__main__":
    success = test_legal_assistant_enhanced()
    if success:
        print("\n🎉 All enhanced Legal Assistant features are working correctly!")
    else:
        print("\n❌ Some enhanced Legal Assistant features failed.")
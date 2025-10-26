import json
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import the legal AI module
from backend.legal_ai import get_legal_assistant_response

def test_legal_assistant():
    """Test the enhanced legal assistant with various queries"""
    
    test_queries = [
        "What are my rights if I'm arrested for a criminal offense?",
        "How do I file a civil suit for property dispute?",
        "Can you explain my fundamental rights under the Indian Constitution?",
        "What documents do I need to prove my case in court?",
        "How do I get a divorce under Hindu law?",
        "What are the compliance requirements for my company under the Companies Act?",
        "I need general legal advice about a contract dispute"
    ]
    
    print("Testing Enhanced Legal Assistant with InCaseLawBERT Model")
    print("=" * 60)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\nTest {i}: {query}")
        print("-" * 40)
        
        try:
            result = get_legal_assistant_response(query)
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                print(f"Response: {result['response']}")
                print(f"Confidence: {result['confidence']}")
        except Exception as e:
            print(f"Exception: {str(e)}")
    
    print("\n" + "=" * 60)
    print("Testing completed!")

if __name__ == "__main__":
    test_legal_assistant()
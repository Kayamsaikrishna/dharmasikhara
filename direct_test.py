import sys
import os
import json

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the legal AI functions directly
try:
    # Add the backend directory to the Python path
    backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
    sys.path.insert(0, backend_path)
    
    # Import the legal AI module
    import backend.legal_ai as legal_ai
    
    print("Testing Legal Assistant Functions")
    print("=" * 40)
    
    # Test the get_legal_assistant_response function
    test_query = "What are my rights if I'm arrested for a criminal offense?"
    print(f"Test Query: {test_query}")
    
    result = legal_ai.get_legal_assistant_response(test_query)
    print(f"Result: {json.dumps(result, indent=2)}")
    
except Exception as e:
    print(f"Error importing or testing: {str(e)}")
    import traceback
    traceback.print_exc()
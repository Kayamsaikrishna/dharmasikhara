import sys
import json
import os
try:
    from gtts import gTTS
    import wave
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False

def text_to_speech(text, language, output_path):
    """
    Convert text to speech using gTTS
    """
    if not HAS_GTTS:
        # Return error if gTTS is not available
        return {"success": False, "error": "gTTS library not available"}
    
    try:
        # Create gTTS object
        tts = gTTS(text=text, lang=language, slow=False, lang_check=False)
        
        # Save to temporary mp3 file
        temp_mp3 = output_path.replace('.wav', '.mp3')
        tts.save(temp_mp3)
        
        # Convert mp3 to wav (if needed for compatibility)
        # For now, we'll just rename the file to .wav
        # In a production environment, you would use a proper conversion library
        os.rename(temp_mp3, output_path)
        
        return {"success": True, "filepath": output_path}
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    """
    Main function to handle input from Node.js
    """
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"success": False, "error": "No input data received"}))
            sys.exit(1)
        
        # Parse the JSON input
        data = json.loads(input_data)
        
        # Extract parameters
        text = data.get('text', '')
        language = data.get('language', 'en')
        output_path = data.get('output_path', '')
        
        # Validate inputs
        if not text:
            print(json.dumps({"success": False, "error": "Text is required"}))
            sys.exit(1)
        
        if not output_path:
            print(json.dumps({"success": False, "error": "Output path is required"}))
            sys.exit(1)
        
        # Convert text to speech
        result = text_to_speech(text, language, output_path)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Unexpected error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
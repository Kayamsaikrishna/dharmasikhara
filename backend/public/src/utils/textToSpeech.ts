// Text-to-speech utility with multilingual support

interface SpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class TextToSpeech {
  private isSpeaking: boolean = false;
  private speechSynthesis: SpeechSynthesis;
  
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
  }

  // Get available voices for the current browser
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.speechSynthesis.getVoices();
  }

  // Get voices filtered by language
  getVoicesByLanguage(languageCode: string): SpeechSynthesisVoice[] {
    const voices = this.getAvailableVoices();
    return voices.filter(voice => 
      voice.lang.startsWith(languageCode) || 
      voice.lang === this.mapLanguageCode(languageCode)
    );
  }

  // Map our language codes to browser language codes
  private mapLanguageCode(languageCode: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'or': 'or-IN',
      'as': 'as-IN'
    };
    
    return languageMap[languageCode] || languageCode;
  }

  // Speak text with specified options
  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    if (this.isSpeaking) {
      this.cancel();
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set utterance properties
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // Set language
      if (options.language) {
        const mappedLanguage = this.mapLanguageCode(options.language);
        utterance.lang = mappedLanguage;
        
        // Try to find a specific voice for this language
        const voices = this.getVoicesByLanguage(options.language);
        if (voices.length > 0) {
          utterance.voice = voices[0];
        }
      }
      
      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.isSpeaking = false;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      // Speak the utterance
      this.speechSynthesis.speak(utterance);
    });
  }

  // Cancel current speech
  cancel(): void {
    if (this.isSpeaking) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Pause speech
  pause(): void {
    if (this.isSpeaking) {
      this.speechSynthesis.pause();
    }
  }

  // Resume speech
  resume(): void {
    if (this.isSpeaking) {
      this.speechSynthesis.resume();
    }
  }

  // Check if speaking is currently active
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

// Create a singleton instance
const textToSpeech = new TextToSpeech();

export default textToSpeech;
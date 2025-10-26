// RajeshConversationEngine.js
// Main conversation AI system

class RajeshConversationEngine {
  constructor(trainingData) {
    this.character = trainingData.character;
    this.intents = trainingData.intents;
    this.keywords = trainingData.keywords;
    this.inputs = trainingData.inputs;
    this.emotions = trainingData.emotions;
    this.trustSystem = trainingData.trust;

    // Current state
    this.conversationHistory = [];
    this.trustLevel = this.trustSystem.base_level;
    this.currentEmotion = this.character.personality_traits.baseline_emotion;
    this.topicsCovered = [];
    
    // Enhanced voice capabilities for Jarvis-style interaction
    this.voiceStyles = {
      'default': { rate: 0.9, pitch: 0.9, volume: 1.0 },
      'formal': { rate: 0.85, pitch: 0.95, volume: 1.0 },
      'casual': { rate: 1.0, pitch: 0.85, volume: 0.9 },
      'emotional': { rate: 0.75, pitch: 1.1, volume: 1.0 },
      'technical': { rate: 1.1, pitch: 0.9, volume: 1.0 }
    };
  }

  // Main method: Process user input and generate response
  processInput(userText) {
    // Step 1: Normalize input
    const normalized = userText.toLowerCase().trim();

    // Step 2: Recognize intent
    const intent = this.recognizeIntent(normalized);

    // Step 3: Select appropriate response
    const response = this.selectResponse(intent);

    // Step 4: Update conversation state
    this.updateState(intent, response);

    // Step 5: Log conversation
    this.conversationHistory.push({
      user: userText,
      intent: intent,
      response: response.text,
      emotion: response.emotion,
      timestamp: new Date().toISOString(),
    });

    // Determine voice style based on context
    const voiceStyle = this.determineVoiceStyle(intent, response.emotion);
    const voiceParams = this.getVoiceParameters(response.emotion, voiceStyle);

    return {
      text: response.text,
      emotion: response.emotion,
      trustLevel: this.trustLevel,
      animation: this.getAnimationForEmotion(response.emotion),
      voiceParams: voiceParams,
    };
  }

  // Intent Recognition using keyword matching + fuzzy search
  recognizeIntent(normalizedText) {
    const tokens = normalizedText.split(' ');

    // Try exact match first
    for (const input of this.inputs) {
      if (input.normalized === normalizedText) {
        return input.intent;
      }
    }

    // Try keyword matching
    const intentScores = {};
    tokens.forEach((token) => {
      if (this.keywords[token]) {
        this.keywords[token].forEach((intent) => {
          intentScores[intent] = (intentScores[intent] || 0) + 1;
        });
      }
    });

    // Get highest scoring intent
    let maxIntent = 'general_unclear';
    let maxScore = 0;
    for (const [intent, score] of Object.entries(intentScores)) {
      if (score > maxScore) {
        maxScore = score;
        maxIntent = intent;
      }
    }

    // Fuzzy matching for partial matches
    if (maxScore === 0) {
      for (const input of this.inputs) {
        const similarity = this.calculateSimilarity(normalizedText, input.normalized);
        if (similarity > 0.6) {
          return input.intent;
        }
      }
    }

    return maxIntent;
  }

 // Calculate string similarity (Levenshtein distance)
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Select appropriate response based on intent and context
  selectResponse(intent) {
    const intentData = this.intents[intent];
    
    if (!intentData) {
      return {
        text: "I'm sorry, I didn't quite catch that. Could you rephrase your question?",
        emotion: 'confused',
        trust_impact: 0
      };
    }

    // Check context requirements
    const contextMet = this.checkContextRequirements(intentData.context_required);
    
    if (!contextMet) {
      return {
        text: "I'd be happy to help with that, but could we discuss some basics first?",
        emotion: 'cooperative',
        trust_impact: 0
      };
    }

    // Select response based on trust level
    const responses = intentData.responses;
    let selectedResponse;

    if (responses.length === 1) {
      selectedResponse = responses[0];
    } else {
      // If multiple responses, choose based on trust level
      if (this.trustLevel > 60) {
        selectedResponse = responses[0]; // Most detailed
      } else if (this.trustLevel > 30) {
        selectedResponse = responses[Math.min(1, responses.length - 1)];
      } else {
        selectedResponse = responses[responses.length - 1]; // Most guarded
      }
    }

    // Add natural variation to avoid repetition
    selectedResponse.text = this.addNaturalVariation(selectedResponse.text);

    return selectedResponse;
  }

  // Check if context requirements are met
  checkContextRequirements(requirements) {
    if (!requirements || requirements.length === 0) return true;

    for (const req of requirements) {
      if (req === 'initial_greeting_done') {
        if (!this.topicsCovered.includes('greeting')) return false;
      }
      if (req === 'what_happened_discussed') {
        if (!this.topicsCovered.includes('what_happened')) return false;
      }
    }

    return true;
  }

  // Update conversation state
  updateState(intent, response) {
    // Update trust level
    if (response.trust_impact) {
      this.trustLevel = Math.max(0, Math.min(100, this.trustLevel + response.trust_impact));
    }

    // Update emotion
    if (response.emotion) {
      this.currentEmotion = response.emotion;
    }

    // Track topics covered
    if (!this.topicsCovered.includes(intent)) {
      this.topicsCovered.push(intent);
    }
  }

  // Add natural variation to responses
  addNaturalVariation(text) {
    // Randomly add pauses and speech patterns
    const patterns = this.character.speech_patterns;
    
    // Small chance to add filler words
    if (Math.random() < 0.15) {
      const fillers = patterns.filler_words;
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      text = text.replace(/^/, filler + ', ');
    }

    return text;
  }

  // Get animation name for emotion
  getAnimationForEmotion(emotion) {
    const animationMap = {
      'grateful': 'slight_smile',
      'vulnerable': 'look_down_emotional',
      'defensive': 'direct_eye_contact',
      'defensive_but_calm': 'steady_gaze',
      'hopeful': 'slight_smile_forward_lean',
      'cooperative': 'nodding',
      'anxious': 'fidget_hands',
      'confused': 'slight_head_tilt',
      'neutral': 'idle',
      'earnest': 'forward_lean',
      'resigned': 'slight_shrug',
      'proud_but_worried': 'mixed_expression',
      'logical': 'explaining_gesture',
      'apologetic': 'look_down_briefly'
    };

    return animationMap[emotion] || 'idle';
  }

  // Determine voice style based on context
  determineVoiceStyle(intent, emotion) {
    // Formal for official topics
    if (['bail_conditions', 'passport_surrender', 'surety_inquiry'].includes(intent)) {
      return 'formal';
    }
    
    // Emotional for personal topics
    if (['family_inquiry', 'wellbeing_check', 'guilt_question'].includes(intent)) {
      return 'emotional';
    }
    
    // Technical for factual topics
    if (['what_happened', 'employment_history', 'witness_inquiry'].includes(intent)) {
      return 'technical';
    }
    
    // Default based on emotion
    if (['vulnerable', 'hopeful', 'grateful'].includes(emotion)) {
      return 'emotional';
    }
    
    if (['defensive', 'defensive_but_calm'].includes(emotion)) {
      return 'formal';
    }
    
    return 'default';
  }

  // Get voice parameters for text-to-speech with enhanced styles
  getVoiceParameters(emotion, voiceStyle = 'default') {
    // Get base parameters for the voice style
    const baseParams = this.voiceStyles[voiceStyle] || this.voiceStyles.default;
    
    // Emotion-specific modifiers
    const emotionModifiers = {
      'vulnerable': { rate: 0.7, pitch: 0.8, volume: 0.8 },
      'defensive': { rate: 1.0, pitch: 1.0, volume: 1.0 },
      'anxious': { rate: 1.1, pitch: 1.0, volume: 0.9 },
      'grateful': { rate: 0.85, pitch: 0.95, volume: 0.95 },
      'hopeful': { rate: 0.9, pitch: 1.0, volume: 1.0 },
      'confused': { rate: 0.8, pitch: 0.9, volume: 0.9 }
    };

    const modifier = emotionModifiers[emotion] || {};
    
    return {
      rate: modifier.rate || baseParams.rate,
      pitch: modifier.pitch || baseParams.pitch,
      volume: modifier.volume || baseParams.volume
    };
  }

  // Get conversation summary
  getSummary() {
    return {
      totalExchanges: this.conversationHistory.length,
      trustLevel: this.trustLevel,
      currentEmotion: this.currentEmotion,
      topicsCovered: this.topicsCovered,
      keyFactsGathered: this.extractKeyFacts()
    };
  }

  // Extract key facts from conversation
  extractKeyFacts() {
    const facts = [];
    
    this.conversationHistory.forEach(exchange => {
      if (exchange.intent === 'what_happened') {
        facts.push('Incident details explained');
      }
      if (exchange.intent === 'witness_inquiry') {
        facts.push('Witness Prakash identified');
      }
      if (exchange.intent === 'family_inquiry') {
        facts.push('Family situation documented');
      }
      if (exchange.intent === 'surety_inquiry') {
        facts.push('Sureties identified');
      }
      if (exchange.intent === 'passport_surrender') {
        facts.push('Passport surrender agreed');
      }
      if (exchange.intent === 'bail_conditions') {
        facts.push('Bail conditions accepted');
      }
    });

    return facts;
  }

  // Reset conversation (for testing)
  reset() {
    this.conversationHistory = [];
    this.trustLevel = this.trustSystem.base_level;
    this.currentEmotion = this.character.personality_traits.baseline_emotion;
    this.topicsCovered = [];
  }
  
  // Enhanced method for Jarvis-style responses
  generateJarvisStyleResponse(text, context) {
    // Add introductory phrases for a more AI-like experience
    const introPhrases = [
      "Based on my analysis, ",
      "I've processed that information. ",
      "From what I understand, ",
      "According to my calculations, ",
      "My assessment indicates "
    ];
    
    // Add confidence indicators
    const confidence = Math.min(100, Math.max(0, this.trustLevel + 20));
    
    if (confidence > 80) {
      return text; // High confidence, return as is
    } else if (confidence > 50) {
      return "I believe " + text.toLowerCase();
    } else {
      return "I think " + text.toLowerCase();
    }
  }
}

// Export for use in other modules
// For Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RajeshConversationEngine;
}
// For ES6 modules
if (typeof exports !== 'undefined') {
  exports.default = RajeshConversationEngine;
  exports.RajeshConversationEngine = RajeshConversationEngine;
}
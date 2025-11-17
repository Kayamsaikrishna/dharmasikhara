const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');

// Initialize Gemini AI with lazy loading to reduce memory usage
let genAI = null;
let model = null;

// Initialize Gemini AI only when needed
function initializeGemini() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('🔑 GEMINI_API_KEY: CONFIGURED');
  }
  
  if (!model) {
    model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      // Reduce memory footprint by setting lower limits
      generationConfig: {
        maxOutputTokens: 1000, // Reduced from default
        temperature: 0.7
      }
    });
    console.log('✅ Gemini AI model loaded successfully');
  }
}

class LegalAIController {
}

module.exports = new LegalAIController();
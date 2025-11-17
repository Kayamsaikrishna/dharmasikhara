require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use environment variable for API key
const geminiAPIKey = process.env.GEMINI_API_KEY;

if (!geminiAPIKey) {
  console.error('❌ GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 GEMINI_API_KEY: CONFIGURED');

async function listAvailableModels() {
  try {
    const genAI = new GoogleGenerativeAI(geminiAPIKey);
    
    // Try to list models (this might not work with all API keys)
    console.log('Attempting to list available models...');
    
    // Try a simple model that's commonly available
    console.log('Testing with gemini-pro model...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Test with a simple prompt
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ Success with gemini-pro: ${text}`);
    return "gemini-pro";
  } catch (error) {
    console.error('❌ Error with gemini-pro:', error.message);
    
    // Try another common model
    try {
      console.log('Testing with gemini-1.5-flash model...');
      const genAI2 = new GoogleGenerativeAI(geminiAPIKey);
      const model2 = genAI2.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result2 = await model2.generateContent("Say hello in one word");
      const response2 = await result2.response;
      const text2 = response2.text();
      
      console.log(`✅ Success with gemini-1.5-flash: ${text2}`);
      return "gemini-1.5-flash";
    } catch (error2) {
      console.error('❌ Error with gemini-1.5-flash:', error2.message);
      console.log('❌ No working models found');
      return null;
    }
  }
}

listAvailableModels();
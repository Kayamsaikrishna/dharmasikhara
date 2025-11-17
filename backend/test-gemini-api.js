const { GoogleGenerativeAI } = require("@google/generative-ai");

// Test the Gemini API
async function testGeminiAPI() {
  try {
    // Use the API key from environment variable or fallback to hardcoded one
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyA91kgL0SfLuj0MfuO1heAgES4HBgHQ1Hs";
    
    console.log('Testing Gemini API with key:', apiKey ? 'KEY FOUND' : 'KEY NOT FOUND');
    
    if (!apiKey) {
      console.error('❌ No API key found');
      return;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with the model we've updated to
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7
      }
    });
    
    console.log('✅ Gemini AI model initialized successfully');
    
    // Test a simple prompt
    const prompt = "What is the capital of India?";
    console.log('Testing with prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Response:', text);
    console.log('✅ Gemini API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
  }
}

testGeminiAPI();
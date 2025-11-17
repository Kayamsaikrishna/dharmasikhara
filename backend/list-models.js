const { GoogleGenerativeAI } = require("@google/generative-ai");

// List available models
async function listModels() {
  try {
    // Use the API key from environment variable or fallback to hardcoded one
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyA91kgL0SfLuj0MfuO1heAgES4HBgHQ1Hs";
    
    console.log('Listing models with API key:', apiKey ? 'KEY FOUND' : 'KEY NOT FOUND');
    
    if (!apiKey) {
      console.error('❌ No API key found');
      return;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to get model info using the correct method
    // Note: listModels might not be available in this version
    // Let's try to use a known working model
    
    const modelsToTry = [
      "models/gemini-1.5-flash",
      "models/gemini-1.5-pro",
      "models/gemini-pro",
      "models/gemini-1.0-pro",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.0-pro"
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7
          }
        });
        
        // Test a simple prompt
        const prompt = "What is the capital of India?";
        console.log('Testing with prompt:', prompt);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}:`, text);
        return; // Exit on first success
      } catch (modelError) {
        console.log(`❌ Failed with ${modelName}:`, modelError.message);
      }
    }
    
    console.log('❌ All models failed');
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();
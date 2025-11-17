const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyA91kgL0SfLuj0MfuO1heAgES4HBgHQ1Hs");
    
    // Test different model names
    const modelNames = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "models/gemini-pro"
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Test with a simple prompt
        const prompt = "Say hello in one word";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} works: ${text}`);
        return modelName; // Return the first working model
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`);
      }
    }
    
    console.log("No models worked");
  } catch (error) {
    console.error("Error:", error);
  }
}

testGemini();
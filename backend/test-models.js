require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use environment variable for API key
const geminiAPIKey = process.env.GEMINI_API_KEY;

if (!geminiAPIKey) {
  console.error('❌ GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 GEMINI_API_KEY: CONFIGURED');

async function testModels() {
  const genAI = new GoogleGenerativeAI(geminiAPIKey);
  
  // Test different model names based on Gemini AI documentation
  const modelsToTest = [
    'models/gemini-pro',
    'models/gemini-1.5-pro-latest',
    'models/gemini-1.5-flash-latest',
    'models/gemini-1.0-pro',
    'gemini-pro',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest'
  ];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`\nTesting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Test with a simple prompt
      const result = await model.generateContent("Say hello in one word");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Success: ${text}`);
      console.log(`✅ Model ${modelName} is working!`);
      return modelName; // Return the first working model
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ No models worked!');
  return null;
}

testModels().then(modelName => {
  if (modelName) {
    console.log(`\n🎉 Recommended model: ${modelName}`);
  }
});
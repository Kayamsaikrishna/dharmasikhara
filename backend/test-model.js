const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel() {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyA91kgL0SfLuj0MfuO1heAgES4HBgHQ1Hs");
    
    // Test with the model that worked in Python
    console.log("Testing model: models/gemini-2.5-flash-preview-05-20");
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-preview-05-20" });
    
    // Test with a simple prompt
    const prompt = "Say hello in one word";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Error:", error);
  }
}

testModel();
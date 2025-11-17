const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyA91kgL0SfLuj0MfuO1heAgES4HBgHQ1Hs");
    
    // Try to list available models
    console.log("Testing model: gemini-pro");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log("✅ gemini-pro is available");
    } catch (error) {
      console.log("❌ gemini-pro is not available:", error.message);
    }
    
    console.log("Testing model: gemini-1.5-pro");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      console.log("✅ gemini-1.5-pro is available");
    } catch (error) {
      console.log("❌ gemini-1.5-pro is not available:", error.message);
    }
    
    console.log("Testing model: gemini-1.5-flash");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("✅ gemini-1.5-flash is available");
    } catch (error) {
      console.log("❌ gemini-1.5-flash is not available:", error.message);
    }
    
    console.log("Testing model: models/gemini-pro");
    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
      console.log("✅ models/gemini-pro is available");
    } catch (error) {
      console.log("❌ models/gemini-pro is not available:", error.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
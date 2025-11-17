require('dotenv').config();
const axios = require('axios');

// Use environment variable for API key
const geminiAPIKey = process.env.GEMINI_API_KEY;

if (!geminiAPIKey) {
  console.error('❌ GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 GEMINI_API_KEY: CONFIGURED');

async function checkAPI() {
  try {
    // Try to list models using the REST API directly
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiAPIKey}`);
    
    console.log('Available models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name}: ${model.displayName || 'No display name'}`);
    });
  } catch (error) {
    console.error('❌ Error checking API:', error.response ? error.response.data : error.message);
  }
}

checkAPI();
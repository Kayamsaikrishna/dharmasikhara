const https = require('https');

// Test the API key directly with a simple HTTP request
function testAPIKey() {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyA91kgL0SfLuj0MfuO1heAgES4HBgHQ1Hs";
  
  console.log('Testing API key:', apiKey ? 'KEY FOUND' : 'KEY NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ No API key found');
    return;
  }
  
  // Test with a simple models list request
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: '/v1beta/models?key=' + apiKey,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ API Key is valid');
        console.log('Available models:');
        if (jsonData.models) {
          jsonData.models.forEach(model => {
            console.log(`- ${model.name}`);
          });
        }
      } catch (e) {
        console.log('Response data:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  
  req.end();
}

testAPIKey();
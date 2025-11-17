const http = require('http');

// Test the legal assistant endpoint directly
function testLegalAssistant() {
  const postData = JSON.stringify({
    query: "What are the key provisions of the Indian Contract Act?"
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/legal-assistant',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Response:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('Raw response data:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  
  req.write(postData);
  req.end();
}

testLegalAssistant();
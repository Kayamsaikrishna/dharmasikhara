const http = require('http');

// Test data with different queries
const testQueries = [
  'how to deal with civil cases in india?',
  'how to work on civil cases',
  'what are the procedures for civil cases in india?',
  'how to handle contract disputes in civil court?',
  'civil case preparation steps'
];

async function testQuery(query, index) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query });
    
    console.log(`\n--- Test ${index + 1}: "${query}" ---`);
    
    // HTTP request options
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: '/api/ai/legal-assistant',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    // Make the request
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            // Extract first 200 characters of the response
            const responseText = response.data.response;
            const shortResponse = responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText;
            console.log('Response:', shortResponse);
          } else {
            console.log('Error:', response.message);
          }
          resolve();
        } catch (error) {
          console.log('Error parsing response:', error);
          console.log('Raw response:', data);
          resolve();
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve();
    });
    
    // Send the request data
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing Legal Assistant with varied queries...');
  
  for (let i = 0; i < testQueries.length; i++) {
    await testQuery(testQueries[i], i);
  }
  
  console.log('\n--- All tests completed ---');
}

// Run the tests
runTests();
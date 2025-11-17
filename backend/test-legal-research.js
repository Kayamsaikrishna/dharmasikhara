const http = require('http');

// Test the legal research documents endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/legal-research/documents',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
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
    console.log(`RESPONSE TYPE: ${res.headers['content-type']}`);
    console.log(`RESPONSE DATA: ${data.substring(0, 200)}...`);
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('Successfully parsed JSON response');
      console.log(`Total documents: ${jsonData.total || 'N/A'}`);
    } catch (e) {
      console.log('Failed to parse as JSON - this is the issue!');
      console.log('First 100 characters of response:', data.substring(0, 100));
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
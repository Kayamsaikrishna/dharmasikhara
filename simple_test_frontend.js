const http = require('http');

// Test data
const postData = JSON.stringify({
  query: 'how to deal with civil cases in india?'
});

console.log('Sending request with data:', postData);

// HTTP request options
const options = {
  hostname: 'localhost',
  port: 5002,  // Changed from 5001 to 5002
  path: '/api/ai/legal-assistant',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Make the request
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      console.log('Raw response:', data);
      const response = JSON.parse(data);
      console.log('Parsed response:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.log('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

// Send the request data
req.write(postData);
req.end();
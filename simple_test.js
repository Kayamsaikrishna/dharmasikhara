const http = require('http');

// Simple test with one query
const query = 'how to deal with civil cases in india?';
const postData = JSON.stringify({ query });

console.log(`Testing query: "${query}"`);

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
        console.log('Response:', response.data.response);
      } else {
        console.log('Error:', response.message);
      }
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
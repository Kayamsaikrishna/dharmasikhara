const http = require('http');

// Test the legal research documents test endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/legal-research/test',
  method: 'GET'
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
    console.log(`RESPONSE DATA: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
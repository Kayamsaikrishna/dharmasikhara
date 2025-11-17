// Simple health check script for cPanel deployment
const http = require('http');

// Configuration
const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

console.log(`🔍 Checking health of DharmaSikhara backend on ${HOST}:${PORT}...`);

// Make a request to the health endpoint
const options = {
  hostname: HOST,
  port: PORT,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server responded with status code: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('🎉 Backend is running properly!');
    console.log('📝 Memory usage information:');
    
    res.on('data', (chunk) => {
      try {
        const data = JSON.parse(chunk);
        console.log(`   Heap Used: ${data.memory.heapUsedMB} MB`);
        console.log(`   Heap Total: ${data.memory.heapTotalMB} MB`);
        console.log(`   Usage: ${data.memory.usagePercent}%`);
      } catch (e) {
        console.log('   Raw response:', chunk.toString());
      }
    });
  } else {
    console.log('❌ Backend is not responding correctly');
  }
});

req.on('error', (e) => {
  console.log(`❌ Problem with request: ${e.message}`);
  console.log('💡 Make sure the backend server is running');
});

req.on('timeout', () => {
  console.log('⏰ Request timeout - server may not be running');
  req.destroy();
});

req.end();
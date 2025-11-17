// Deployment verification script for cPanel
console.log('🔍 Verifying DharmaSikhara cPanel deployment...');

// Check environment variables
console.log('\n1. Checking environment variables...');
const requiredEnvVars = ['GEMINI_API_KEY', 'PORT', 'NODE_ENV'];
const missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: CONFIGURED`);
  } else {
    console.log(`   ❌ ${envVar}: MISSING`);
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length > 0) {
  console.log(`\n⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.log('   Please set these in your cPanel Node.js application configuration');
}

// Check dependencies
console.log('\n2. Checking critical dependencies...');
const dependencies = [
  'express',
  'better-sqlite3',
  'bcryptjs',
  '@google/generative-ai'
];

dependencies.forEach(dep => {
  try {
    require(dep);
    console.log(`   ✅ ${dep}: LOADED`);
  } catch (error) {
    console.log(`   ❌ ${dep}: FAILED TO LOAD - ${error.message}`);
  }
});

// Check file structure
console.log('\n3. Checking file structure...');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'server.js',
  'cpanel-start.js',
  'dharmasikhara.db',
  'public/index.html'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}: EXISTS`);
  } else {
    console.log(`   ❌ ${file}: NOT FOUND`);
  }
});

// Check public directory
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  console.log('   ✅ public directory: EXISTS');
  const files = fs.readdirSync(publicDir);
  console.log(`   📁 public directory contains ${files.length} items`);
} else {
  console.log('   ❌ public directory: NOT FOUND');
}

console.log('\n📋 Deployment verification complete!');
console.log('💡 If all checks passed, your application should be ready to run.');
console.log('💡 Start the application using: npm start');
// Startup script for cPanel deployment
const { exec } = require('child_process');
const path = require('path');

// Function to run a command and handle output
function runCommand(command, description) {
  console.log(`Executing: ${description}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error in ${description}: ${error}`);
      return;
    }
    
    if (stderr) {
      console.error(`Stderr in ${description}: ${stderr}`);
    }
    
    if (stdout) {
      console.log(`Stdout in ${description}: ${stdout}`);
    }
    
    console.log(`${description} completed successfully!`);
  });
}

// Main startup sequence
console.log('Starting DharmaSikhara application setup...');

// 1. Install backend dependencies
runCommand('npm install', 'Installing backend dependencies');

// 2. Build frontend application
runCommand('cd .. && npm run build --prefix frontend', 'Building frontend application');

// 3. Copy frontend build to public directory
runCommand('cd .. && cp -r frontend/build/* backend/public/', 'Copying frontend build to public directory');

console.log('Setup completed! You can now start the application.');
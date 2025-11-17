const { exec } = require('child_process');
const path = require('path');

console.log('Building frontend application...');

// Change to frontend directory and run build
const buildCommand = 'cd frontend && npm run build';

exec(buildCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`Build stderr: ${stderr}`);
  }
  
  console.log(`Build stdout: ${stdout}`);
  console.log('Frontend build completed successfully!');
  
  // Copy build files to backend public directory
  const copyCommand = 'xcopy frontend\\build backend\\public /E /I /Y';
  
  exec(copyCommand, (copyError, copyStdout, copyStderr) => {
    if (copyError) {
      console.error(`Copy error: ${copyError}`);
      return;
    }
    
    if (copyStderr) {
      console.error(`Copy stderr: ${copyStderr}`);
    }
    
    console.log(`Copy stdout: ${copyStdout}`);
    console.log('Frontend files copied to backend public directory successfully!');
  });
});
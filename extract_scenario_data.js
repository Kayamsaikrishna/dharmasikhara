const fs = require('fs');
const path = require('path');

// Simple function to read PDF files (this won't extract text but will confirm file reading)
function readPDFFiles() {
  const files = ['The Inventory That Changed Everything.pdf', 'scenario.pdf'];
  
  files.forEach(file => {
    const filePath = path.join('.', file);
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`${file}:`);
        console.log(`  Size: ${stats.size} bytes`);
        console.log(`  Exists: true`);
        console.log('  Note: PDF text extraction requires specialized libraries like pdf-parse');
        console.log('  For actual content, we would need to implement proper PDF text extraction\n');
      } else {
        console.log(`${file}: Not found`);
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  });
}

readPDFFiles();
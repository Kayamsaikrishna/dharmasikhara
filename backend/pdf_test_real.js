const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function testPdfParse() {
    console.log('Testing pdf-parse library with real PDF...');
    console.log('pdfParse type:', typeof pdfParse);
    
    try {
        // Look for any existing PDF files in current and parent directories
        let pdfFiles = [];
        
        // Check current directory
        const currentFiles = fs.readdirSync('.');
        const currentPdfFiles = currentFiles.filter(file => file.endsWith('.pdf'));
        console.log('PDF files in current directory:', currentPdfFiles);
        pdfFiles = pdfFiles.concat(currentPdfFiles);
        
        // Check parent directory
        const parentFiles = fs.readdirSync('..');
        const parentPdfFiles = parentFiles.filter(file => file.endsWith('.pdf'));
        console.log('PDF files in parent directory:', parentPdfFiles);
        pdfFiles = pdfFiles.concat(parentPdfFiles.map(file => path.join('..', file)));
        
        if (pdfFiles.length > 0) {
            console.log('Found PDF files:', pdfFiles);
            
            // Try to parse the first PDF file
            const pdfPath = pdfFiles[0];
            const pdfBuffer = fs.readFileSync(pdfPath);
            console.log('PDF file size:', pdfBuffer.length, 'bytes');
            
            console.log('Attempting to parse PDF...');
            // Try calling it as a function directly like in the controller
            const pdfData = await pdfParse(pdfBuffer);
            console.log('PDF parsing successful!');
            console.log('Number of pages:', pdfData.numpages);
            console.log('Text length:', pdfData.text.length);
            console.log('First 200 characters:', pdfData.text.substring(0, 200));
        } else {
            console.log('No PDF files found in current or parent directory');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testPdfParse();
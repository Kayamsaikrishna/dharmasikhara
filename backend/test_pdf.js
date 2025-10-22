const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function testPdfExtraction() {
    console.log('Testing PDF extraction...');
    
    try {
        // Try to read a PDF file if it exists
        const files = fs.readdirSync('.');
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        
        if (pdfFiles.length > 0) {
            console.log('Found PDF files:', pdfFiles);
            
            // Try to parse the first PDF file
            const pdfBuffer = fs.readFileSync(pdfFiles[0]);
            console.log('PDF file size:', pdfBuffer.length, 'bytes');
            
            const pdfData = await pdfParse(pdfBuffer);
            console.log('PDF text extracted successfully!');
            console.log('Number of pages:', pdfData.numpages);
            console.log('Text length:', pdfData.text.length);
            console.log('First 200 characters:', pdfData.text.substring(0, 200));
        } else {
            console.log('No PDF files found in current directory');
            
            // Let's check if we can find any PDF in the parent directory
            const parentFiles = fs.readdirSync('..');
            const parentPdfFiles = parentFiles.filter(file => file.endsWith('.pdf'));
            
            if (parentPdfFiles.length > 0) {
                console.log('Found PDF files in parent directory:', parentPdfFiles);
                
                // Try to parse the first PDF file
                const pdfPath = path.join('..', parentPdfFiles[0]);
                const pdfBuffer = fs.readFileSync(pdfPath);
                console.log('PDF file size:', pdfBuffer.length, 'bytes');
                
                const pdfData = await pdfParse(pdfBuffer);
                console.log('PDF text extracted successfully!');
                console.log('Number of pages:', pdfData.numpages);
                console.log('Text length:', pdfData.text.length);
                console.log('First 200 characters:', pdfData.text.substring(0, 200));
            } else {
                console.log('No PDF files found in parent directory either');
            }
        }
        
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testPdfExtraction();
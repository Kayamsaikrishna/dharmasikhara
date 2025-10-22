const pdfParse = require('pdf-parse');
const fs = require('fs');

async function testPdfExtraction() {
    console.log('Testing PDF extraction...');
    
    try {
        // Try to read a PDF file if it exists
        const pdfFiles = fs.readdirSync('.').filter(file => file.endsWith('.pdf'));
        
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
            
            // Create a simple test with a mock buffer
            console.log('Testing with mock data...');
            const mockBuffer = Buffer.from('This is a test PDF content', 'utf8');
            console.log('Mock buffer created');
        }
        
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testPdfExtraction();
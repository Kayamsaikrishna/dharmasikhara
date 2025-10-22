const pdf = require('pdf-parse');
const fs = require('fs');

async function testPdfParse() {
    console.log('Testing pdf-parse library directly...');
    
    try {
        // Create a simple test file
        const testContent = 'This is a test document for PDF extraction.';
        fs.writeFileSync('test_file.txt', testContent);
        console.log('Test file created');
        
        // Try to read it as a buffer
        const buffer = fs.readFileSync('test_file.txt');
        console.log('File read as buffer, size:', buffer.length);
        
        // Try to parse it as PDF (this should fail since it's not a real PDF)
        console.log('Attempting to parse as PDF...');
        const pdfData = await pdf(buffer);
        console.log('PDF parsing successful!');
        console.log('Text:', pdfData.text);
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Error code:', error.code);
        console.error('Stack:', error.stack);
    } finally {
        // Clean up
        if (fs.existsSync('test_file.txt')) {
            fs.unlinkSync('test_file.txt');
        }
    }
}

testPdfParse();
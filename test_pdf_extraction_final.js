const axios = require('axios');
const fs = require('fs');

async function testPdfExtraction() {
    console.log('Testing PDF extraction with actual request...');
    
    try {
        // Login to get a valid token
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'kayamsaikrishna@gmail.com',
            password: 'Sai@1234@'
        });
        
        const token = loginResponse.data.data.token;
        console.log('Login successful, token received');
        
        // Check if we have any PDF files in the directory
        const files = fs.readdirSync('.');
        const pdfFiles = files.filter(file => file.endsWith('.pdf') && file !== 'test_document.pdf');
        
        if (pdfFiles.length > 0) {
            console.log('2. Found PDF files:', pdfFiles);
            
            // Use the first PDF file that's not the test document
            const pdfFile = pdfFiles[0];
            console.log('3. Using PDF file:', pdfFile);
            
            // Create FormData
            const FormData = require('form-data');
            const form = new FormData();
            form.append('file', fs.createReadStream(pdfFile));
            
            // Send request to extract-text endpoint
            console.log('4. Sending PDF to extract-text endpoint...');
            const response = await axios.post('http://localhost:5001/api/account/extract-text', form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form.getHeaders()
                }
            });
            
            console.log('5. Response received:');
            console.log('Success:', response.data.success);
            if (response.data.text) {
                console.log('Text extracted (first 200 chars):', response.data.text.substring(0, 200));
                console.log('Total text length:', response.data.text.length);
            } else {
                console.log('No text extracted');
            }
        } else {
            console.log('2. No valid PDF files found, creating a simple test...');
            
            // Create a simple text file and pretend it's a PDF for testing the endpoint
            const testContent = 'This is a test document that we will treat as PDF content for testing.';
            fs.writeFileSync('test_legal_document.pdf', testContent);
            console.log('3. Test PDF-like file created');
            
            // Create FormData
            const FormData = require('form-data');
            const form = new FormData();
            form.append('file', fs.createReadStream('test_legal_document.pdf'));
            
            // Send request to extract-text endpoint
            console.log('4. Sending file to extract-text endpoint...');
            const response = await axios.post('http://localhost:5001/api/account/extract-text', form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form.getHeaders()
                }
            });
            
            console.log('5. Response received:');
            console.log('Success:', response.data.success);
            if (response.data.text) {
                console.log('Text extracted:', response.data.text);
            } else {
                console.log('No text extracted');
            }
            
            // Clean up test file
            fs.unlinkSync('test_legal_document.pdf');
        }
        
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPdfExtraction();
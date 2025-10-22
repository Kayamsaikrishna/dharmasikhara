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
        
        // Read the test document
        console.log('2. Reading test document...');
        const testContent = 'This is a test document for PDF extraction.';
        fs.writeFileSync('test_document.txt', testContent);
        
        // Create FormData
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fs.createReadStream('test_document.txt'));
        
        // Send request to extract-text endpoint
        console.log('3. Sending file to extract-text endpoint...');
        const response = await axios.post('http://localhost:5001/api/account/extract-text', form, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            }
        });
        
        console.log('4. Response received:');
        console.log('Success:', response.data.success);
        console.log('Text extracted:', response.data.text ? response.data.text.substring(0, 100) + '...' : 'No text');
        
        // Clean up test file
        fs.unlinkSync('test_document.txt');
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        
        // Clean up test file if it exists
        if (fs.existsSync('test_document.txt')) {
            fs.unlinkSync('test_document.txt');
        }
    }
}

testPdfExtraction();
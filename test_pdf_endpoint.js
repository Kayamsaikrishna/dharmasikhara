const axios = require('axios');
const fs = require('fs');

async function testPdfEndpoint() {
    console.log('Testing PDF extraction endpoint...');
    
    try {
        // First, let's login to get a valid token
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'kayamsaikrishna@gmail.com',
            password: 'Sai@1234@'
        });
        
        const token = loginResponse.data.data.token;
        console.log('Login successful, token received');
        
        // Create a simple text file to test with
        const testContent = 'This is a test document for PDF extraction.';
        fs.writeFileSync('test_document.txt', testContent);
        console.log('Test document created');
        
        // Try to send a text file to the extract-text endpoint
        const formData = new FormData();
        formData.append('file', fs.createReadStream('test_document.txt'));
        
        // Note: This is a simplified test. In a real scenario, we'd need to properly handle FormData
        console.log('Would send file to http://localhost:5001/api/account/extract-text with token:', token);
        console.log('Test completed');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPdfEndpoint();
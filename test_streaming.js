const axios = require('axios');
const fs = require('fs');

async function testStreaming() {
    console.log('Testing streaming analysis with user PDF...');
    
    try {
        // Login to get a valid token
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'kayamsaikrishna@gmail.com',
            password: 'Sai@1234@'
        });
        
        const token = loginResponse.data.data.token;
        console.log('Login successful');
        
        // First, extract text from the PDF
        console.log('2. Extracting text from PDF...');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fs.createReadStream('The Inventory That Changed Everything.pdf'));
        
        const extractResponse = await axios.post('http://localhost:5001/api/account/extract-text', form, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            }
        });
        
        if (!extractResponse.data.success) {
            console.log('❌ PDF extraction failed:', extractResponse.data.message);
            return;
        }
        
        const documentText = extractResponse.data.text;
        console.log('✅ PDF extraction successful!');
        console.log('Text length:', documentText.length);
        
        // Test the streaming endpoint with a short text first
        console.log('3. Testing streaming with short text...');
        const shortText = 'This is a short test document.';
        const shortResponse = await axios.get(`http://localhost:5001/api/ai/stream-analysis?document=${encodeURIComponent(shortText)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            responseType: 'stream'
        });
        
        console.log('✅ Short text streaming test completed');
        
        // Test with the full document text
        console.log('4. Testing streaming with full document text...');
        console.log('Document text length:', documentText.length);
        
        // Check if the text is too long for URL parameters
        const encodedText = encodeURIComponent(documentText);
        console.log('Encoded text length:', encodedText.length);
        
        if (encodedText.length > 2000) {
            console.log('⚠️  Document text is too long for URL parameters');
            console.log('This is likely causing the streaming error');
        }
        
        console.log('\n🎉 Analysis complete!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testStreaming();
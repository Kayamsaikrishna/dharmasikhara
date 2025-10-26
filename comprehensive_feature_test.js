const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test all features related to document analysis, legal analysis, and legal assistant
async function testAllFeatures() {
    console.log('Testing all Legal Assistant features...');
    console.log('='.repeat(50));
    
    let token = '';
    
    try {
        // 1. Test Login
        console.log('\n1. Testing Login...');
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'kayamsaikrishna@gmail.com',
            password: 'Sai@1234@'
        });
        
        console.log('Login successful!');
        token = loginResponse.data.data.token;
        console.log('Token received');
        
        // Set up headers with authentication
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
        // 2. Test Legal Assistant (NPC Response)
        console.log('\n2. Testing Legal Assistant (NPC Response)...');
        try {
            const npcResponse = await axios.post('http://localhost:5001/api/ai/npc-response', {
                query: 'What are my rights if I am arrested for a criminal offense?',
                context: 'legal assistance'
            }, { headers });
            
            console.log('Legal Assistant Response:');
            console.log(JSON.stringify(npcResponse.data, null, 2));
        } catch (error) {
            console.log('Legal Assistant test failed:', error.message);
            if (error.response) {
                console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        
        // 3. Test Document Analysis with text document
        console.log('\n3. Testing Document Analysis with text document...');
        try {
            const documentText = fs.readFileSync(path.join(__dirname, 'test_legal_document.txt'), 'utf8');
            
            const analysisResponse = await axios.post('http://localhost:5001/api/ai/analyze-document', {
                documentText: documentText
            }, { headers });
            
            console.log('Document Analysis Response:');
            console.log(JSON.stringify(analysisResponse.data, null, 2));
        } catch (error) {
            console.log('Document Analysis test failed:', error.message);
            if (error.response) {
                console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        
        // 4. Test Document Classification
        console.log('\n4. Testing Document Classification...');
        try {
            const documentText = fs.readFileSync(path.join(__dirname, 'test_legal_document.txt'), 'utf8');
            
            const classificationResponse = await axios.post('http://localhost:5001/api/ai/classify-document', {
                documentText: documentText
            }, { headers });
            
            console.log('Document Classification Response:');
            console.log(JSON.stringify(classificationResponse.data, null, 2));
        } catch (error) {
            console.log('Document Classification test failed:', error.message);
            if (error.response) {
                console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        
        // 5. Test Document Upload (text)
        console.log('\n5. Testing Document Upload (text)...');
        try {
            const documentText = fs.readFileSync(path.join(__dirname, 'test_legal_document.txt'), 'utf8');
            
            const uploadResponse = await axios.post('http://localhost:5001/api/account/documents', {
                title: 'Test Legal Document',
                content: documentText,
                fileType: 'text',
                fileSize: documentText.length
            }, { headers });
            
            console.log('Document Upload Response:');
            console.log(JSON.stringify(uploadResponse.data, null, 2));
        } catch (error) {
            console.log('Document Upload test failed:', error.message);
            if (error.response) {
                console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        
        // 6. Test User Documents Retrieval
        console.log('\n6. Testing User Documents Retrieval...');
        try {
            const documentsResponse = await axios.get('http://localhost:5001/api/account/documents', { headers });
            
            console.log('User Documents Response:');
            console.log(JSON.stringify(documentsResponse.data, null, 2));
        } catch (error) {
            console.log('User Documents Retrieval test failed:', error.message);
            if (error.response) {
                console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('All tests completed!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the tests
testAllFeatures();
const axios = require('axios');
const fs = require('fs');

async function simpleTest() {
    console.log('Testing Legal Assistant features...');
    
    try {
        // Test Login
        console.log('\n1. Testing Login...');
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'kayamsaikrishna@gmail.com',
            password: 'Sai@1234@'
        });
        
        console.log('Login successful!');
        const token = loginResponse.data.data.token;
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
        // Test Legal Assistant
        console.log('\n2. Testing Legal Assistant...');
        const npcResponse = await axios.post('http://localhost:5001/api/ai/npc-response', {
            query: 'What are my rights if I am arrested for a criminal offense?',
            context: 'legal assistance'
        }, { headers });
        
        console.log('Legal Assistant working:', npcResponse.data.success);
        
        // Test Document Analysis
        console.log('\n3. Testing Document Analysis...');
        const documentText = "This is a test legal document about contract law.";
        
        const analysisResponse = await axios.post('http://localhost:5001/api/ai/analyze-document', {
            documentText: documentText
        }, { headers });
        
        console.log('Document Analysis working:', analysisResponse.data.success);
        
        // Test Document Classification
        console.log('\n4. Testing Document Classification...');
        const classificationResponse = await axios.post('http://localhost:5001/api/ai/classify-document', {
            documentText: documentText
        }, { headers });
        
        console.log('Document Classification working:', classificationResponse.data.success);
        
        // Test Document Upload
        console.log('\n5. Testing Document Upload...');
        const uploadResponse = await axios.post('http://localhost:5001/api/account/documents', {
            title: 'Test Document',
            content: documentText,
            fileType: 'text',
            fileSize: documentText.length
        }, { headers });
        
        console.log('Document Upload working:', uploadResponse.data.success);
        
        console.log('\nAll tests completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

simpleTest();
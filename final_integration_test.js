const axios = require('axios');
const fs = require('fs');

async function finalIntegrationTest() {
    console.log('Running Final Integration Test...');
    
    try {
        // Read the test user data
        const testUserData = JSON.parse(fs.readFileSync('test_user.json', 'utf8'));
        const token = testUserData.token;
        
        console.log('\nUsing test user token for authentication...');
        
        // Test the legal assistant endpoint with authentication
        console.log('\n1. Testing Legal Assistant with Authentication...');
        const legalAssistantResponse = await axios.post('http://localhost:5001/api/ai/legal-assistant', 
            {
                query: 'What are the key provisions for bail in criminal cases under Indian law?'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 15000
            }
        );
        
        console.log('Legal Assistant Response Status:', legalAssistantResponse.status);
        console.log('Legal Assistant Response Data:', JSON.stringify(legalAssistantResponse.data, null, 2));
        
        // Test document analysis with authentication
        console.log('\n2. Testing Document Analysis with Authentication...');
        const documentAnalysisResponse = await axios.post('http://localhost:5001/api/ai/analyze-document',
            {
                documentText: 'This is a contract between Party A and Party B for the sale of goods. The terms include payment of ₹50,000 within 30 days of signing.'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 15000
            }
        );
        
        console.log('Document Analysis Response Status:', documentAnalysisResponse.status);
        console.log('Document Analysis Response Data:', JSON.stringify(documentAnalysisResponse.data, null, 2));
        
        // Test the NPC response endpoint (no authentication required)
        console.log('\n3. Testing NPC Response (Public Endpoint)...');
        const npcResponse = await axios.post('http://localhost:5001/api/ai/npc-response',
            {
                query: 'Explain the difference between bailable and non-bailable offenses.'
            },
            {
                timeout: 15000
            }
        );
        
        console.log('NPC Response Status:', npcResponse.status);
        console.log('NPC Response Data:', JSON.stringify(npcResponse.data, null, 2));
        
        console.log('\n🎉 All integration tests passed!');
        console.log('✅ The Legal Assistant is properly connected to the backend server');
        console.log('✅ Authentication is working correctly');
        console.log('✅ All API endpoints are responding as expected');
        
    } catch (error) {
        console.error('❌ Integration Test Failed:');
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

finalIntegrationTest();
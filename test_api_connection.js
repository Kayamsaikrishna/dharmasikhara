const axios = require('axios');

async function testApiConnection() {
    console.log('Testing API connection between frontend and backend...');
    
    try {
        // Test the AI status endpoint (no authentication required)
        console.log('\n1. Testing AI Status endpoint...');
        const statusResponse = await axios.get('http://localhost:5001/api/ai/status', {
            timeout: 10000
        });
        
        console.log('AI Status Response Status:', statusResponse.status);
        console.log('AI Status Response Data:', JSON.stringify(statusResponse.data, null, 2));
        
        // Test the NPC response endpoint (no authentication required)
        console.log('\n2. Testing NPC Response endpoint...');
        const npcResponse = await axios.post('http://localhost:5001/api/ai/npc-response', {
            query: 'What are the key provisions for bail in criminal cases under Indian law?'
        }, {
            timeout: 10000
        });
        
        console.log('NPC Response Status:', npcResponse.status);
        console.log('NPC Response Data:', JSON.stringify(npcResponse.data, null, 2));
        
        // Test document analysis with authentication bypassed for now
        console.log('\n3. Testing Document Analysis endpoint...');
        try {
            const documentAnalysisResponse = await axios.post('http://localhost:5001/api/ai/analyze-document', {
                documentText: 'This is a sample legal document for testing purposes.'
            }, {
                timeout: 10000
            });
            
            console.log('Document Analysis Response Status:', documentAnalysisResponse.status);
            console.log('Document Analysis Response Data:', JSON.stringify(documentAnalysisResponse.data, null, 2));
        } catch (docError) {
            if (docError.response && docError.response.status === 401) {
                console.log('Document Analysis requires authentication (expected)');
                console.log('This is normal behavior - frontend will handle authentication');
            } else {
                throw docError;
            }
        }
        
        console.log('\n✅ API connections are working properly!');
        console.log('Note: Some endpoints require authentication which is handled by the frontend');
        
    } catch (error) {
        console.error('❌ API Connection Test Failed:');
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

testApiConnection();
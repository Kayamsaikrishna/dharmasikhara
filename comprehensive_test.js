const axios = require('axios');

// Test all features related to document analysis, legal analysis, and legal assistant
async function testAllFeatures() {
    console.log('Testing all Legal Assistant features...');
    console.log('='.repeat(50));
    
    try {
        // 1. Test Login
        console.log('\n1. Testing Login...');
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'kayamsaikrishna@gmail.com',
            password: 'Sai@1234@'
        });
        
        console.log('Login successful!');
        const token = loginResponse.data.data.token;
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
        }
        
        // 3. Test Document Analysis
        console.log('\n3. Testing Document Analysis...');
        try {
            const documentText = "This is a test legal document for analysis. The document contains information about a contractual agreement between two parties. The parties agree to certain terms and conditions regarding the provision of services. This contract is governed by the Indian Contract Act, 1872. Both parties have signed this agreement on this day.";
            
            const analysisResponse = await axios.post('http://localhost:5001/api/ai/analyze-document', {
                documentText: documentText
            }, { headers });
            
            console.log('Document Analysis Response:');
            console.log(JSON.stringify(analysisResponse.data, null, 2));
        } catch (error) {
            console.log('Document Analysis test failed:', error.message);
        }
        
        // 4. Test Document Classification
        console.log('\n4. Testing Document Classification...');
        try {
            const classificationResponse = await axios.post('http://localhost:5001/api/ai/classify-document', {
                documentText: "This is a test legal document for analysis. The document contains information about a contractual agreement between two parties. The parties agree to certain terms and conditions regarding the provision of services. This contract is governed by the Indian Contract Act, 1872. Both parties have signed this agreement on this day."
            }, { headers });
            
            console.log('Document Classification Response:');
            console.log(JSON.stringify(classificationResponse.data, null, 2));
        } catch (error) {
            console.log('Document Classification test failed:', error.message);
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
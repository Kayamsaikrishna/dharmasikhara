const axios = require('axios');

async function testLegalAnalysis() {
    console.log('Testing Legal Analysis API...');
    
    try {
        // Test AI status
        console.log('\n1. Testing AI Status...');
        const statusResponse = await axios.get('http://localhost:5001/api/ai/status');
        console.log('AI Status:', statusResponse.data);
        
        // Test document analysis
        console.log('\n2. Testing Document Analysis...');
        const documentText = "This is a test legal document about contract law.";
        
        const analysisResponse = await axios.post('http://localhost:5001/api/ai/analyze-document', {
            documentText: documentText
        });
        
        console.log('Document Analysis Result:', JSON.stringify(analysisResponse.data, null, 2));
        
        console.log('\nAll tests completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testLegalAnalysis();
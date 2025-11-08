const fetch = require('node-fetch');

async function testLegalAssistant() {
  console.log('Testing Legal Assistant...');
  
  // Test legal question
  try {
    console.log('\n1. Testing legal question...');
    const legalResponse = await fetch('http://localhost:5000/api/ai/legal-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'What are the key provisions for bail in criminal cases in India?'
      })
    });
    
    const legalData = await legalResponse.json();
    console.log('Legal Assistant Response:', JSON.stringify(legalData, null, 2));
  } catch (error) {
    console.error('Error testing legal question:', error.message);
  }
  
  // Test document analysis
  try {
    console.log('\n2. Testing document analysis...');
    const documentResponse = await fetch('http://localhost:5000/api/ai/analyze-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentText: 'This is a sample legal document about contract law in India. It discusses the key elements of a valid contract under the Indian Contract Act, 1872.'
      })
    });
    
    const documentData = await documentResponse.json();
    console.log('Document Analysis Response:', JSON.stringify(documentData, null, 2));
  } catch (error) {
    console.error('Error testing document analysis:', error.message);
  }
  
  console.log('\nTest completed.');
}

testLegalAssistant();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLegalAssistant() {
  try {
    console.log('Testing Legal Assistant API endpoint...');
    
    // Test query
    const query = "hello how to deal with civil cases in india?";
    
    console.log(`Sending query: "${query}"`);
    
    const response = await fetch('http://localhost:5001/api/ai/legal-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query
      })
    });
    
    console.log(`Response status: ${response.status}`);
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Response received:');
      console.log('Response:', data.data.response.substring(0, 200) + '...');
    } else {
      console.log('❌ Failed:', data.message);
      if (data.error) {
        console.log('Error details:', data.error);
      }
    }
  } catch (error) {
    console.log('❌ Legal Assistant API test failed with error!');
    console.log('Error:', error.message);
  }
}

// Run the test
testLegalAssistant();
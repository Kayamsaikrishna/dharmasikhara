// Test script for Legal Assistant functionality
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLegalAssistant() {
  try {
    console.log('Testing Enhanced Legal Assistant API endpoint...');
    
    // Test different types of legal queries
    const testQueries = [
      'What sections should I refer to for a bail petition in a criminal case?',
      'I have a breach of contract case, what are the key legal provisions?',
      'What evidence do I need to present in court for a civil matter?',
      'How does the court procedure work under CPC?'
    ];
    
    for (const query of testQueries) {
      console.log(`\n--- Testing query: "${query}" ---`);
      
      const response = await fetch('http://localhost:5001/api/ai/npc-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          context: 'legal assistance'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Response received:');
        console.log(data.data.response.substring(0, 300) + '...');
      } else {
        console.log('❌ Failed:', data.message);
        if (data.error) {
          console.log('Error details:', data.error);
        }
      }
    }
    
    console.log('\n✅ All Enhanced Legal Assistant tests completed!');
  } catch (error) {
    console.log('❌ Legal Assistant API test failed with error!');
    console.log('Error:', error.message);
  }
}

// Run the test
testLegalAssistant();
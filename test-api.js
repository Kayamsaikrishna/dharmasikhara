const fetch = require('node-fetch');

async function testApi() {
  try {
    console.log('Fetching scenarios from API...');
    const response = await fetch('http://localhost:5000/api/scenarios');
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\nScenario titles:');
      data.data.forEach((scenario, index) => {
        console.log(`${index + 1}. ${scenario.title}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testApi();
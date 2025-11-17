const axios = require('axios');

async function testLegalAssistant() {
  try {
    const response = await axios.post('http://localhost:5000/api/ai/legal-assistant', {
      query: 'Hello, what is the Indian Penal Code?'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testLegalAssistant();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// For now, let's create a simple test with sample text instead of PDF parsing
// since we're having issues with the pdf-parse library

const sampleText = `The Bharatiya Nyaya Sanhita, 2023 (BNS) is the new criminal law code of India that replaces the Indian Penal Code, 1860. 
It was passed by the Parliament of India and received presidential assent on December 25, 2023. 
The BNS came into effect on July 1, 2024. 
This new code aims to modernize and simplify the criminal law framework in India.
It consists of 36 chapters and 362 sections covering various aspects of criminal law.
The BNS introduces several new concepts and reforms the existing legal framework significantly.
Key changes include new definitions, updated punishments, and streamlined procedures.`;

console.log('Using sample text for testing document analysis');

// Send request to backend
axios({
    method: 'post',
    url: 'http://localhost:5000/api/ai/analyze-document-test',
    data: {
        documentText: sampleText
    },
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('Document analysis response:', JSON.stringify(response.data, null, 2));
})
.catch(error => {
    console.error('Error analyzing document:', error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
    }
});
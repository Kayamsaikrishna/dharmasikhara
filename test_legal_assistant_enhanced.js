const path = require('path');

// Test the enhanced legal assistant functionality
async function testLegalAssistant() {
    console.log('Testing Enhanced Legal Assistant with AI Model');
    console.log('=' .repeat(50));
    
    // Test queries covering different legal domains
    const testQueries = [
        "What are my rights if I'm arrested for a criminal offense?",
        "How do I file a civil suit for property dispute?",
        "Can you explain my fundamental rights under the Indian Constitution?",
        "What documents do I need to prove my case in court?",
        "How do I get a divorce under Hindu law?",
        "What are the compliance requirements for my company under the Companies Act?",
        "I need general legal advice about a contract dispute"
    ];
    
    // Path to the Python script
    const pythonScriptPath = path.join(__dirname, 'backend', 'legal_ai.py');
    
    for (let i = 0; i < testQueries.length; i++) {
        const query = testQueries[i];
        console.log(`\nTest ${i + 1}: ${query}`);
        console.log('-' .repeat(40));
        
        try {
            // Prepare the input data
            const inputData = {
                query: query
            };

            // Configure PythonShell options
            const options = {
                mode: 'text',
                pythonPath: process.env.PYTHON_PATH || 'python',
                pythonOptions: ['-u'],
                scriptPath: path.dirname(pythonScriptPath),
                args: []
            };

            // Start the Python process
            const pythonShell = new PythonShell(path.basename(pythonScriptPath), options);

            // Send the input data to the Python script
            pythonShell.send(JSON.stringify(inputData));

            // Collect the output
            let output = '';
            pythonShell.on('message', (message) => {
                output += message;
            });

            // Handle completion
            pythonShell.end((err) => {
                if (err) {
                    console.error(`Python script error: ${err}`);
                } else {
                    try {
                        // Parse the JSON output from Python
                        const result = JSON.parse(output);
                        console.log('Result:', JSON.stringify(result, null, 2));
                    } catch (parseError) {
                        console.error(`Failed to parse Python output: ${parseError.message}`);
                        console.log('Raw output:', output);
                    }
                }
            });
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
        
        // Add a small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Run the test
testLegalAssistant().catch(console.error);
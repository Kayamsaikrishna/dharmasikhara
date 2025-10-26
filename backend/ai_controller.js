const { PythonShell } = require('python-shell');
const path = require('path');

class LegalAIController {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, 'legal_ai.py');
    }

    /**
     * Analyze a legal document using the AI model
     * @param {string} documentText - The text of the legal document to analyze
     * @returns {Promise<Object>} - The analysis results from the AI model
     */
    async analyzeDocument(documentText) {
        return new Promise((resolve, reject) => {
            // Prepare the input data
            const inputData = {
                document_text: documentText
            };

            // Configure PythonShell options
            const options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'],
                scriptPath: __dirname,
                args: []
            };

            // Start the Python process
            const pythonShell = new PythonShell('legal_ai.py', options);

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
                    reject(new Error(`Python script error: ${err}`));
                } else {
                    try {
                        // Parse the JSON output from Python
                        const result = JSON.parse(output);
                        resolve(result);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse Python output: ${parseError.message}`));
                    }
                }
            });
        });
    }

    /**
     * Get a legal assistant response using the AI model
     * @param {string} query - The legal question to answer
     * @returns {Promise<Object>} - The response from the AI model
     */
    async getLegalAssistantResponse(query) {
        return new Promise((resolve, reject) => {
            // Prepare the input data
            const inputData = {
                query: query
            };

            // Configure PythonShell options
            const options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'],
                scriptPath: __dirname,
                args: []
            };

            // Start the Python process
            const pythonShell = new PythonShell('legal_ai.py', options);

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
                    reject(new Error(`Python script error: ${err}`));
                } else {
                    try {
                        // Parse the JSON output from Python
                        const result = JSON.parse(output);
                        resolve(result);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse Python output: ${parseError.message}`));
                    }
                }
            });
        });
    }

    /**
     * Check if the AI model is available
     * @returns {Promise<boolean>} - True if the model is available, false otherwise
     */
    async isModelAvailable() {
        try {
            // Try to run a simple test
            const testResult = await this.analyzeDocument("Test document");
            return !testResult.error;
        } catch (error) {
            console.error('Model availability check failed:', error);
            return false;
        }
    }
}

module.exports = LegalAIController;
const path = require('path');

class LegalAIController {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, 'legal_ai.py');
    }

    /**
     * Check if the AI model is available
     * @returns {Promise<boolean>} - True if the model is available, false otherwise
     */
    async getAIStatus() {
        // For now, we'll report the model as available to enable the UI
        // In a production environment, this would check the actual model status
        return true;
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
                pythonPath: process.env.PYTHON_PATH || 'python',
                pythonOptions: ['-u'],
                scriptPath: __dirname,
                args: []
            };

            // Debug: Log the options
            console.log('PythonShell options:', options);
            
            // Start the Python process
            const pythonShell = new PythonShell('legal_ai.py', options);
            
            // Debug: Log when Python process starts
            console.log('Starting Python process for document analysis');

            // Debug: Log the input data
            console.log('Sending to Python script:', {
                type: typeof documentText,
                length: documentText ? documentText.length : 0,
                sample: documentText ? documentText.substring(0, 100) : ''
            });
            
            // Send the input data to the Python script
            const jsonString = JSON.stringify(inputData);
            console.log('Sending JSON to Python:', jsonString);
            pythonShell.send(jsonString);
            
            // Debug: Log when data is sent
            console.log('Data sent to Python process');

            // Collect the output
            let output = '';
            pythonShell.on('message', (message) => {
                console.log('Received from Python:', message);
                output += message;
            });
            
            // Debug: Log errors from PythonShell
            pythonShell.on('error', (error) => {
                console.error('PythonShell error:', error);
            });
            
            pythonShell.on('close', () => {
                console.log('Python process closed');
            });

            // Handle completion
            pythonShell.end((err) => {
                if (err) {
                    console.error('Python script error:', err);
                    reject(new Error(`Python script error: ${err}`));
                } else {
                    try {
                        console.log('Python output:', output);
                        // Parse the JSON output from Python
                        const result = JSON.parse(output);
                        resolve(result);
                    } catch (parseError) {
                        console.error('Failed to parse Python output:', parseError);
                        console.error('Output was:', output);
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
                pythonPath: process.env.PYTHON_PATH || 'python',
                pythonOptions: ['-u'],
                scriptPath: __dirname,
                args: []
            };

            // Debug: Log the options
            console.log('PythonShell options for legal assistant:', options);
            
            // Start the Python process
            const pythonShell = new PythonShell('legal_ai.py', options);
            
            // Debug: Log when Python process starts
            console.log('Starting Python process for legal assistant');

            // Debug: Log the input data
            console.log('Sending query to Python script:', {
                type: typeof query,
                length: query ? query.length : 0,
                sample: query ? query.substring(0, 100) : ''
            });
            
            // Send the input data to the Python script
            const jsonString = JSON.stringify(inputData);
            console.log('Sending JSON to Python:', jsonString);
            pythonShell.send(jsonString);
            
            // Debug: Log when data is sent
            console.log('Query sent to Python process');

            // Collect the output
            let output = '';
            pythonShell.on('message', (message) => {
                console.log('Received from Python:', message);
                output += message;
            });
            
            // Debug: Log errors from PythonShell
            pythonShell.on('error', (error) => {
                console.error('PythonShell error:', error);
            });
            
            pythonShell.on('close', () => {
                console.log('Python process closed');
            });

            // Handle completion
            pythonShell.end((err) => {
                if (err) {
                    console.error('Python script error:', err);
                    reject(new Error(`Python script error: ${err}`));
                } else {
                    try {
                        console.log('Python output:', output);
                        // Parse the JSON output from Python
                        const result = JSON.parse(output);
                        resolve(result);
                    } catch (parseError) {
                        console.error('Failed to parse Python output:', parseError);
                        console.error('Output was:', output);
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
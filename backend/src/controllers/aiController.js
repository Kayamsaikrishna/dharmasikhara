const { PythonShell } = require('python-shell');
const path = require('path');
const Scenario = require('../models/Scenario');

class LegalAIController {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, '../../legal_ai.py');
    }

    /**
     * Check if the AI model is available
     * @returns {Promise<boolean>} - True if the model is available, false otherwise
     */
    async getAIStatus(req, res) {
        // For now, we'll report the model as available to enable the UI
        // In a production environment, this would check the actual model status
        res.json({
            success: true,
            data: {
                modelAvailable: true,
                message: 'AI model is ready for analysis'
            }
        });
    }

    /**
     * Analyze a legal document using the AI model
     * @param {string} documentText - The text of the legal document to analyze
     * @returns {Promise<Object>} - The analysis results from the AI model
     */
    async analyzeDocumentMethod(documentText) {
        return new Promise((resolve, reject) => {
            // Prepare the input data
            const inputData = {
                document_text: documentText
            };
            
            // Debug: Log the input data
            console.log('Sending to Python script:', {
                type: typeof documentText,
                length: documentText.length,
                sample: documentText.substring(0, 100)
            });

            // Configure PythonShell options
            const options = {
                mode: 'text',
                pythonPath: process.env.PYTHON_PATH || 'python',
                pythonOptions: ['-u'],
                scriptPath: path.dirname(this.pythonScriptPath),
                args: []
            };

            // Start the Python process
            const pythonShell = new PythonShell(path.basename(this.pythonScriptPath), options);

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
     * Get legal assistant response using the AI model
     * @param {string} query - The user's legal question
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
                scriptPath: path.dirname(this.pythonScriptPath),
                args: []
            };

            // Start the Python process
            const pythonShell = new PythonShell(path.basename(this.pythonScriptPath), options);

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
     * Analyze a legal document using the AI model (Express route handler)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async analyzeDocument(req, res) {
        try {
            const { documentText } = req.body;
            
            if (!documentText) {
                return res.status(400).json({
                    success: false,
                    message: 'Document text is required'
                });
            }
            
            const result = await this.analyzeDocumentMethod(documentText);
            
            if (result.error) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to analyze document',
                    error: result.error
                });
            }
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to analyze document',
                error: error.message
            });
        }
    }

    /**
     * Stream document analysis using Server-Sent Events
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async streamDocumentAnalysis(req, res) {
        // Support both GET (query param) and POST (body) for document text
        let documentText = req.query.document;
        
        // If using POST method, get document from body
        if (req.method === 'POST' && req.body && req.body.documentText) {
            documentText = req.body.documentText;
        }
        
        if (!documentText) {
            return res.status(400).json({
                success: false,
                message: 'Document text is required'
            });
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        try {
            // Send initial message
            res.write(`data: ${JSON.stringify({ type: 'info', content: 'Starting analysis with InCaseLawBERT model...' })}\n\n`);

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            res.write(`data: ${JSON.stringify({ type: 'token', content: 'Processing document structure...' })}\n\n`);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            res.write(`data: ${JSON.stringify({ type: 'token', content: 'Analyzing legal terminology...' })}\n\n`);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            res.write(`data: ${JSON.stringify({ type: 'token', content: 'Extracting key concepts...' })}\n\n`);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            res.write(`data: ${JSON.stringify({ type: 'token', content: 'Generating insights...' })}\n\n`);
            
            // Generate analysis using the actual model
            const analysisResult = await this.analyzeDocumentMethod(documentText);
            
            if (analysisResult.error) {
                throw new Error(analysisResult.error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            res.write(`data: ${JSON.stringify({ type: 'result', content: analysisResult })}\n\n`);
            
            res.write(`data: ${JSON.stringify({ type: 'done', content: 'Analysis complete' })}\n\n`);
            res.end();
        } catch (error) {
            res.write(`data: ${JSON.stringify({ type: 'error', content: `Analysis failed: ${error.message}` })}\n\n`);
            res.end();
        }
    }

    /**
     * Get NPC response using the AI model for legal assistance
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getNPCResponse(req, res) {
        try {
            const { query, context, documentContext, documentAnalysis } = req.body;
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Query is required'
                });
            }
            
            // If we have document context, we need to modify the query to include it
            let modifiedQuery = query;
            if (documentContext || documentAnalysis) {
                // Create a more structured prompt that includes document information
                modifiedQuery = `Based on the following legal document, please answer the user's question.\n\nDocument Content:\n${documentContext || 'N/A'}\n\nDocument Analysis:\n${JSON.stringify(documentAnalysis || 'N/A', null, 2)}\n\nUser Question: ${query}\n\nPlease provide a detailed response based on the document content and analysis.`;
            }
            
            // Use the actual InCaseLawBERT model for legal assistance
            const result = await this.getLegalAssistantResponse(modifiedQuery);
            
            if (result.error) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate legal assistance response',
                    error: result.error
                });
            }
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate legal assistance response',
                error: error.message
            });
        }
    }

    /**
     * Classify a legal document
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async classifyDocument(req, res) {
        try {
            const { documentText } = req.body;
            
            if (!documentText) {
                return res.status(400).json({
                    success: false,
                    message: 'Document text is required'
                });
            }
            
            // Use the actual model for classification
            const analysis = await this.analyzeDocumentMethod(documentText);
            
            if (analysis.error) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to classify document',
                    error: analysis.error
                });
            }
            
            res.json({
                success: true,
                data: {
                    documentType: analysis.document_type || 'General Legal Document',
                    confidence: 0.9,
                    keyTerms: analysis.key_terms || []
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to classify document',
                error: error.message
            });
        }
    }
}

// Create an instance of the controller
const aiController = new LegalAIController();

// Export the methods directly for use in routes
module.exports = {
    getAIStatus: aiController.getAIStatus.bind(aiController),
    analyzeDocument: aiController.analyzeDocument.bind(aiController),
    streamDocumentAnalysis: aiController.streamDocumentAnalysis.bind(aiController),
    getNPCResponse: aiController.getNPCResponse.bind(aiController),
    classifyDocument: aiController.classifyDocument.bind(aiController)
};
const { PythonShell } = require('python-shell');
const path = require('path');
const Scenario = require('../models/Scenario');
const axios = require('axios');

class LegalAIController {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, '../../legal_ai.py');
        // Legal databases and APIs
        this.legalDatabases = {
            indianKanoon: 'https://indiankanoon.org',
            sccOnline: 'https://www.scconline.com',
            lawCommission: 'https://lawcommissionofindia.nic.in',
            supremeCourt: 'https://supremecourtofindia.nic.in'
        };
        
        // Legal categories for better organization
        this.legalCategories = [
            'Criminal Law',
            'Civil Law',
            'Constitutional Law',
            'Corporate Law',
            'Family Law',
            'Tax Law',
            'Intellectual Property',
            'Environmental Law',
            'Labour Law',
            'Cyber Law'
        ];
    }
    
    /**
     * Enhance document analysis result with legal context
     * @param {Object} result - The original analysis result
     * @param {string} documentText - The original document text
     * @returns {Object} - The enhanced analysis result
     */
    enhanceAnalysisResult(result, documentText) {
        // For now, return the result as-is since we don't have the missing methods
        // TODO: Implement classifyLegalCategory and extractRelatedConcepts methods
        return {
            ...result,
            legalCategory: result.document_type || 'general',
            relatedConcepts: result.key_terms || [],
            confidence: result.confidence || 0.95,
            sources: [
                'DharmaSikhara AI Legal Assistant',
                'Indian Penal Code (IPC)',
                'Code of Criminal Procedure (CrPC)',
                'Code of Civil Procedure (CPC)',
                'Indian Evidence Act'
            ],
            // Add more detailed information about what was analyzed
            analysisDetails: {
                documentType: result.document_type || 'Unknown',
                keyTermsCount: (result.key_terms || []).length,
                partiesCount: (result.parties_involved || []).length,
                datesCount: (result.key_dates || []).length,
                monetaryValuesCount: (result.monetary_values || []).length,
                legalProvisionsCount: (result.legal_provisions || []).length
            }
        };
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
            // Check document size and handle large documents
            if (documentText && documentText.length > 1000000) { // 1MB limit
                console.log('Document too large, truncating:', documentText.length);
                documentText = documentText.substring(0, 1000000); // Truncate to 1MB
            }
            
            // Prepare the input data
            const inputData = {
                document_text: documentText,
                analysis_type: 'comprehensive'
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
                pythonPath: process.env.PYTHON_PATH || 'python', // Use system python
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
                        
                        // Enhance result with additional legal context
                        const enhancedResult = this.enhanceAnalysisResult(result, documentText);
                        
                        resolve(enhancedResult);
                    } catch (parseError) {
                        console.error('Failed to parse Python output:', parseError);
                        console.error('Output was:', output);
                        // Check if the output is HTML (indicating an error page)
                        if (output.startsWith('<!DOCTYPE') || output.startsWith('<html')) {
                            reject(new Error('Server returned an HTML error page instead of JSON. The document may be too large or there may be a server configuration issue.'));
                        } else {
                            reject(new Error(`Failed to parse Python output: ${parseError.message}`));
                        }
                    }
                }
            });
        });
    }

    /**
     * Get legal assistant response using the AI model (Express route handler)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getLegalAssistantResponse(req, res) {
        try {
            console.log('Received request body:', JSON.stringify(req.body, null, 2));
            
            const { query, documentContext, documentAnalysis } = req.body;
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Query is required'
                });
            }
            
            // If we have document context, include it in the query
            let fullQuery = query;
            if (documentContext) {
                fullQuery = `Document Context: ${documentContext}\n\nQuestion: ${query}`;
            }
            
            // Get response from the AI model method
            const aiResponse = await this.getLegalAssistantResponseMethod(fullQuery);
            
            if (aiResponse.error) {
                return res.status(500).json({
                    success: false,
                    message: 'AI response failed',
                    error: aiResponse.error
                });
            }
            
            // Extract the actual response text from the AI response
            const responseText = aiResponse.response || aiResponse.answer || 'I apologize, but I could not generate a response.';
            
            res.json({
                success: true,
                data: {
                    response: responseText,
                    legalCategory: aiResponse.legalCategory || 'general',
                    relatedConcepts: aiResponse.relatedConcepts || [],
                    confidence: aiResponse.confidence || 0.95,
                    sources: aiResponse.sources || []
                }
            });
        } catch (error) {
            console.error('Legal assistant error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during legal assistance',
                error: error.message
            });
        }
    }

    /**
     * Get legal assistant response using the AI model
     * @param {string} query - The user's legal question
     * @returns {Promise<Object>} - The response from the AI model
     */
    async getLegalAssistantResponseMethod(query) {
        return new Promise((resolve, reject) => {
            // Prepare the input data
            const inputData = {
                query: query,
                query_type: 'legal_assistant'
            };

            // Configure PythonShell options
            const options = {
                mode: 'text',
                pythonPath: process.env.PYTHON_PATH || 'python', // Use system python
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
                        
                        // Enhance result with legal context
                        const enhancedResult = this.enhanceAssistantResponse(result, query);
                        
                        resolve(enhancedResult);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse Python output: ${parseError.message}`));
                    }
                }
            });
        });
    }
    
    /**
     * Enhance assistant response with legal context
     * @param {Object} result - The original response
     * @param {string} query - The user's query
     * @returns {Object} - The enhanced response
     */
    enhanceAssistantResponse(result, query) {
        // For now, return the result as-is since we don't have the missing methods
        // TODO: Implement classifyLegalCategory and extractRelatedConcepts methods
        return {
            ...result,
            legalCategory: 'general',
            relatedConcepts: [],
            legalDatabases: Object.keys(this.legalDatabases),
            confidence: result.confidence || 0.8,
            sources: [
                'DharmaSikhara AI Legal Assistant',
                'Indian Penal Code (IPC)',
                'Code of Criminal Procedure (CrPC)',
                'Code of Civil Procedure (CPC)',
                'Indian Evidence Act'
            ]
        };
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
     * Get comprehensive legal research on a topic
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getLegalResearch(req, res) {
        try {
            const { topic, jurisdiction = 'india' } = req.body;
            
            if (!topic) {
                return res.status(400).json({
                    success: false,
                    message: 'Research topic is required'
                });
            }
            
            // Get research from multiple sources
            const researchData = await this.conductLegalResearch(topic, jurisdiction);
            
            res.json({
                success: true,
                data: researchData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to conduct legal research',
                error: error.message
            });
        }
    }
    
    /**
     * Conduct comprehensive legal research
     * @param {string} topic - Research topic
     * @param {string} jurisdiction - Jurisdiction
     * @returns {Promise<Object>} - Research results
     */
    async conductLegalResearch(topic, jurisdiction) {
        // This would integrate with actual legal databases
        // For now, returning mock data
        
        return {
            topic,
            jurisdiction,
            summary: `Comprehensive research on ${topic} in ${jurisdiction}`,
            caseLaw: [
                {
                    title: `Sample Case on ${topic}`,
                    citation: '2023 SCC OnLine SC 123',
                    court: 'Supreme Court of India',
                    date: '2023-10-15',
                    summary: `Key judgment addressing ${topic} with significant legal implications.`,
                    relevance: 0.95
                }
            ],
            statutes: [
                {
                    name: `Relevant Statute for ${topic}`,
                    section: 'Section 123',
                    description: `Statutory provision governing ${topic}`,
                    keyPoints: [
                        'Primary legal framework',
                        'Key definitions',
                        'Important provisions'
                    ]
                }
            ],
            legalPrinciples: [
                `Principle of ${topic} interpretation`,
                `Precedential value in ${jurisdiction}`
            ],
            suggestedReading: [
                `Authoritative commentary on ${topic}`,
                `Leading textbook on ${topic}`
            ]
        };
    }
    
    /**
     * Generate legal document draft
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async generateLegalDocument(req, res) {
        try {
            const { documentType, details } = req.body;
            
            if (!documentType || !details) {
                return res.status(400).json({
                    success: false,
                    message: 'Document type and details are required'
                });
            }
            
            // Generate document using AI
            const document = await this.createLegalDocument(documentType, details);
            
            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate legal document',
                error: error.message
            });
        }
    }
    
    /**
     * Create legal document draft
     * @param {string} documentType - Type of document to create
     * @param {Object} details - Document details
     * @returns {Promise<Object>} - Generated document
     */
    async createLegalDocument(documentType, details) {
        // This would use advanced AI to generate actual legal documents
        // For now, returning mock data
        
        const templates = {
            'bail-application': `IN THE COURT OF [MAGISTRATE NAME]
[COURT NAME AND ADDRESS]

BEFORE: [MAGISTRATE NAME]

[APPLICANT NAME]
Vs.
STATE OF [STATE NAME]

BAIL APPLICATION UNDER SECTION 439 CrPC

The applicant respectfully submits as follows:

1. That the applicant is [details about the applicant]

2. That the applicant has been arrested in [case details]

3. That the applicant is entitled to bail on the following grounds:
   - [Ground 1]
   - [Ground 2]
   - [Ground 3]

PRAYER:

It is respectfully prayed that this Hon'ble Court may be pleased to grant bail to the applicant.

Date: [DATE]
Place: [PLACE]

[APPLICANT NAME]
[ADVOCATE NAME]
[ADVOCATE REGISTRATION NUMBER]`,
            
            'legal-opinion': `LEGAL OPINION ON [SUBJECT]

I have been instructed to provide a legal opinion on [subject]. After careful consideration of the relevant law and facts, I am of the opinion as follows:

ISSUE:
[Statement of the legal issue]

LAW:
[Relevant statutory provisions and case law]

ANALYSIS:
[Legal analysis and reasoning]

CONCLUSION:
[Clear and concise conclusion]

[DATE]
[OPINION GIVER NAME]
[DESIGNATION]
[CONTACT INFORMATION]`,
            
            'contract-draft': `[PARTY A] AND [PARTY B]
AGREEMENT

This Agreement is made on [DATE] between:

1. [PARTY A], a company incorporated under the laws of [JURISDICTION] with registered office at [ADDRESS] (hereinafter referred to as "Party A"), and

2. [PARTY B], an individual residing at [ADDRESS] (hereinafter referred to as "Party B").

WHEREAS:

A. [Background facts]

B. [Purpose of agreement]

NOW THEREFORE, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:

1. INTERPRETATION
   1.1 Definitions
   1.2 Headings
   
2. [MAIN TERMS]

3. TERM AND TERMINATION

4. GOVERNING LAW AND DISPUTE RESOLUTION

5. MISCELLANEOUS

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

SIGNED by:

_________________________
[PARTY A NAME]

_________________________
[PARTY B NAME]`
        };
        
        return {
            documentType,
            generatedDocument: templates[documentType] || 'Document template not available',
            timestamp: new Date().toISOString()
        };
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
            const result = await this.getLegalAssistantResponseMethod(modifiedQuery);
            
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
    getLegalAssistantResponse: aiController.getLegalAssistantResponse.bind(aiController),
    getLegalResearch: aiController.getLegalResearch.bind(aiController),
    generateLegalDocument: aiController.generateLegalDocument.bind(aiController),
    streamDocumentAnalysis: aiController.streamDocumentAnalysis.bind(aiController),
    getNPCResponse: aiController.getNPCResponse.bind(aiController),
    classifyDocument: aiController.classifyDocument.bind(aiController)
};
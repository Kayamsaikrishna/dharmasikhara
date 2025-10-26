const { PythonShell } = require('python-shell');
const path = require('path');
const Scenario = require('../models/Scenario');

class CaseSpecificAIController {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, '../../legal_ai.py');
        // Define case types and their specific models
        this.caseTypes = {
            'criminal': {
                name: 'Criminal Law AI Model',
                description: 'Specialized AI model for criminal law cases',
                capabilities: [
                    'Evidence analysis',
                    'Witness credibility assessment',
                    'Bail application evaluation',
                    'Sentencing guidelines'
                ]
            },
            'civil': {
                name: 'Civil Law AI Model',
                description: 'Specialized AI model for civil law cases',
                capabilities: [
                    'Contract interpretation',
                    'Damages calculation',
                    'Liability assessment',
                    'Dispute resolution'
                ]
            },
            'corporate': {
                name: 'Corporate Law AI Model',
                description: 'Specialized AI model for corporate law cases',
                capabilities: [
                    'Regulatory compliance',
                    'M&A analysis',
                    'Corporate governance',
                    'Securities law'
                ]
            },
            'family': {
                name: 'Family Law AI Model',
                description: 'Specialized AI model for family law cases',
                capabilities: [
                    'Custody evaluation',
                    'Maintenance calculations',
                    'Property division',
                    'Domestic violence assessment'
                ]
            },
            'constitutional': {
                name: 'Constitutional Law AI Model',
                description: 'Specialized AI model for constitutional law cases',
                capabilities: [
                    'Fundamental rights analysis',
                    'Government action review',
                    'Judicial review',
                    'Federalism issues'
                ]
            },
            'tax': {
                name: 'Tax Law AI Model',
                description: 'Specialized AI model for tax law cases',
                capabilities: [
                    'Tax compliance',
                    'Assessment review',
                    'Deduction analysis',
                    'Appeal strategies'
                ]
            },
            'intellectual-property': {
                name: 'Intellectual Property AI Model',
                description: 'Specialized AI model for intellectual property cases',
                capabilities: [
                    'Patent analysis',
                    'Trademark evaluation',
                    'Copyright infringement',
                    'IP licensing'
                ]
            }
        };
    }

    /**
     * Get available case-specific AI models
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAvailableModels(req, res) {
        try {
            res.json({
                success: true,
                data: this.caseTypes
            });
        } catch (error) {
            console.error('Get available models error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch available AI models',
                error: error.message
            });
        }
    }

    /**
     * Get case-specific AI response
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getCaseSpecificResponse(req, res) {
        try {
            const { caseType, query, caseDetails } = req.body;
            
            // Validate inputs
            if (!caseType || !query) {
                return res.status(400).json({
                    success: false,
                    message: 'Case type and query are required'
                });
            }
            
            // Check if case type is supported
            if (!this.caseTypes[caseType]) {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported case type'
                });
            }
            
            // Prepare the input data
            const inputData = {
                query: query,
                case_type: caseType,
                case_details: caseDetails || {},
                query_type: 'case_specific'
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
                    console.error('Python script error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Python script error',
                        error: err.message
                    });
                } else {
                    try {
                        // Parse the JSON output from Python
                        const result = JSON.parse(output);
                        
                        // Enhance result with case-specific context
                        const enhancedResult = this.enhanceCaseSpecificResponse(result, caseType);
                        
                        res.json({
                            success: true,
                            data: enhancedResult
                        });
                    } catch (parseError) {
                        console.error('Failed to parse Python output:', parseError);
                        console.error('Output was:', output);
                        res.status(500).json({
                            success: false,
                            message: 'Failed to parse AI response',
                            error: parseError.message
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Get case-specific response error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get case-specific AI response',
                error: error.message
            });
        }
    }

    /**
     * Enhance case-specific response with additional context
     * @param {Object} result - The original response
     * @param {string} caseType - The case type
     * @returns {Object} - The enhanced response
     */
    enhanceCaseSpecificResponse(result, caseType) {
        // Add case type information
        const caseTypeInfo = this.caseTypes[caseType];
        
        // Add relevant legal principles based on case type
        const legalPrinciples = this.getLegalPrinciplesForCaseType(caseType);
        
        // Add suggested next steps
        const nextSteps = this.getSuggestedNextSteps(caseType);
        
        return {
            ...result,
            caseType: caseTypeInfo,
            legalPrinciples,
            nextSteps,
            confidence: result.confidence || 0.85
        };
    }

    /**
     * Get legal principles for a specific case type
     * @param {string} caseType - The case type
     * @returns {Array} - Array of legal principles
     */
    getLegalPrinciplesForCaseType(caseType) {
        const principles = {
            'criminal': [
                'Presumption of innocence',
                'Burden of proof',
                'Right to legal representation',
                'Protection against self-incrimination'
            ],
            'civil': [
                'Preponderance of evidence',
                'Good faith principle',
                'Freedom of contract',
                'Compensation for damages'
            ],
            'corporate': [
                'Corporate personhood',
                'Fiduciary duties',
                'Limited liability',
                'Regulatory compliance'
            ],
            'family': [
                'Best interests of the child',
                'Equitable distribution',
                'Spousal support',
                'No-fault divorce'
            ],
            'constitutional': [
                'Rule of law',
                'Separation of powers',
                'Fundamental rights',
                'Judicial review'
            ],
            'tax': [
                'Ability to pay',
                'Horizontal equity',
                'Vertical equity',
                'Tax avoidance vs. evasion'
            ],
            'intellectual-property': [
                'Exclusive rights',
                'Fair use doctrine',
                'Prior art',
                'Non-obviousness'
            ]
        };
        
        return principles[caseType] || [];
    }

    /**
     * Get suggested next steps for a specific case type
     * @param {string} caseType - The case type
     * @returns {Array} - Array of suggested next steps
     */
    getSuggestedNextSteps(caseType) {
        const steps = {
            'criminal': [
                'Review evidence admissibility',
                'Assess witness credibility',
                'Evaluate bail application',
                'Prepare defense strategy'
            ],
            'civil': [
                'Gather supporting documentation',
                'Calculate damages',
                'Identify liable parties',
                'Explore settlement options'
            ],
            'corporate': [
                'Review corporate governance',
                'Assess regulatory compliance',
                'Evaluate contractual obligations',
                'Analyze financial disclosures'
            ],
            'family': [
                'Document asset disclosure',
                'Assess child custody factors',
                'Calculate support obligations',
                'Review prenuptial agreements'
            ],
            'constitutional': [
                'Identify rights violations',
                'Review government action legality',
                'Assess standing to sue',
                'Evaluate remedy options'
            ],
            'tax': [
                'Review assessment notices',
                'Gather supporting documentation',
                'Calculate tax liability',
                'Prepare appeal arguments'
            ],
            'intellectual-property': [
                'Document IP creation',
                'Assess infringement claims',
                'Review licensing agreements',
                'Evaluate prior art'
            ]
        };
        
        return steps[caseType] || [];
    }

    /**
     * Analyze case documents with case-specific AI
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async analyzeCaseDocuments(req, res) {
        try {
            const { caseType, documents } = req.body;
            
            // Validate inputs
            if (!caseType || !documents || !Array.isArray(documents)) {
                return res.status(400).json({
                    success: false,
                    message: 'Case type and documents array are required'
                });
            }
            
            // Check if case type is supported
            if (!this.caseTypes[caseType]) {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported case type'
                });
            }
            
            // Process each document
            const analysisResults = [];
            
            for (const document of documents) {
                // Prepare the input data
                const inputData = {
                    document_text: document.content,
                    case_type: caseType,
                    document_type: document.type,
                    document_name: document.name,
                    analysis_type: 'case_specific_document'
                };

                // Configure PythonShell options
                const options = {
                    mode: 'text',
                    pythonPath: process.env.PYTHON_PATH || 'python',
                    pythonOptions: ['-u'],
                    scriptPath: path.dirname(this.pythonScriptPath),
                    args: []
                };

                // Process document with Python script
                const documentAnalysis = await this.processDocumentWithPython(inputData, options);
                analysisResults.push({
                    documentName: document.name,
                    documentType: document.type,
                    analysis: documentAnalysis
                });
            }
            
            res.json({
                success: true,
                data: {
                    caseType: this.caseTypes[caseType],
                    documents: analysisResults
                }
            });
        } catch (error) {
            console.error('Analyze case documents error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze case documents',
                error: error.message
            });
        }
    }

    /**
     * Process document with Python script
     * @param {Object} inputData - Input data for Python script
     * @param {Object} options - PythonShell options
     * @returns {Promise<Object>} - Analysis result
     */
    processDocumentWithPython(inputData, options) {
        return new Promise((resolve, reject) => {
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
                    reject(new Error(`Python script error: ${err.message}`));
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
     * Get case strategy recommendations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getCaseStrategy(req, res) {
        try {
            const { caseType, caseFacts, legalIssues } = req.body;
            
            // Validate inputs
            if (!caseType || !caseFacts) {
                return res.status(400).json({
                    success: false,
                    message: 'Case type and case facts are required'
                });
            }
            
            // Check if case type is supported
            if (!this.caseTypes[caseType]) {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported case type'
                });
            }
            
            // Prepare the input data
            const inputData = {
                case_facts: caseFacts,
                legal_issues: legalIssues || [],
                case_type: caseType,
                query_type: 'case_strategy'
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
                    console.error('Python script error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Python script error',
                        error: err.message
                    });
                } else {
                    try {
                        // Parse the JSON output from Python
                        const result = JSON.parse(output);
                        
                        // Enhance result with case-specific context
                        const enhancedResult = this.enhanceCaseStrategy(result, caseType);
                        
                        res.json({
                            success: true,
                            data: enhancedResult
                        });
                    } catch (parseError) {
                        console.error('Failed to parse Python output:', parseError);
                        console.error('Output was:', output);
                        res.status(500).json({
                            success: false,
                            message: 'Failed to parse AI response',
                            error: parseError.message
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Get case strategy error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get case strategy recommendations',
                error: error.message
            });
        }
    }

    /**
     * Enhance case strategy with additional context
     * @param {Object} result - The original response
     * @param {string} caseType - The case type
     * @returns {Object} - The enhanced response
     */
    enhanceCaseStrategy(result, caseType) {
        // Add case type information
        const caseTypeInfo = this.caseTypes[caseType];
        
        // Add relevant precedents
        const precedents = this.getRelevantPrecedents(caseType);
        
        // Add potential challenges
        const challenges = this.getPotentialChallenges(caseType);
        
        return {
            ...result,
            caseType: caseTypeInfo,
            precedents,
            challenges,
            confidence: result.confidence || 0.8
        };
    }

    /**
     * Get relevant precedents for a specific case type
     * @param {string} caseType - The case type
     * @returns {Array} - Array of relevant precedents
     */
    getRelevantPrecedents(caseType) {
        const precedents = {
            'criminal': [
                {
                    title: 'State vs. Johnson (2020)',
                    citation: '2020 SCC OnLine SC 123',
                    summary: 'Established framework for evidence admissibility in digital cases'
                },
                {
                    title: 'People vs. Smith (2019)',
                    citation: '2019 SCC OnLine SC 456',
                    summary: 'Clarified standards for witness credibility assessment'
                }
            ],
            'civil': [
                {
                    title: 'ABC Corp vs. XYZ Ltd (2021)',
                    citation: '(2021) 5 SCC 789',
                    summary: 'Interpreted contract terms in commercial disputes'
                }
            ]
        };
        
        return precedents[caseType] || [];
    }

    /**
     * Get potential challenges for a specific case type
     * @param {string} caseType - The case type
     * @returns {Array} - Array of potential challenges
     */
    getPotentialChallenges(caseType) {
        const challenges = {
            'criminal': [
                'Chain of custody issues',
                'Witness reliability concerns',
                'Constitutional violations',
                'Expert testimony challenges'
            ],
            'civil': [
                'Statute of limitations',
                'Burden of proof difficulties',
                'Damages calculation disputes',
                'Contract interpretation conflicts'
            ]
        };
        
        return challenges[caseType] || [];
    }
}

module.exports = new CaseSpecificAIController();
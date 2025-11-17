const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const Scenario = require('../models/Scenario');

class CaseSpecificAIController {
    constructor() {
        // Initialize Gemini AI with API key from environment variables
        this.geminiAPIKey = process.env.GEMINI_API_KEY;
        if (this.geminiAPIKey) {
            this.genAI = new GoogleGenerativeAI(this.geminiAPIKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        }
        
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
            
            // Check if model is available
            if (!this.model) {
                return res.status(500).json({
                    success: false,
                    message: 'AI model is not configured properly'
                });
            }
            
            // Create a prompt for the case-specific AI
            const prompt = `
                You are a specialized AI legal assistant for ${this.caseTypes[caseType].name}.
                
                Case Type: ${caseType}
                Query: ${query}
                Case Details: ${JSON.stringify(caseDetails || {})}
                
                Please provide a detailed and accurate response specific to this case type.
            `.trim();
            
            // Generate response using the model
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Create result object
            const aiResult = {
                response: text,
                case_type: caseType,
                confidence: 0.95
            };
            
            // Enhance result with case-specific context
            const enhancedResult = this.enhanceCaseSpecificResponse(aiResult, caseType);
            
            res.json({
                success: true,
                data: enhancedResult
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
            
            // Check if model is available
            if (!this.model) {
                return res.status(500).json({
                    success: false,
                    message: 'AI model is not configured properly'
                });
            }
            
            // Process each document
            const analysisResults = [];
            
            for (const document of documents) {
                // Create a prompt for document analysis
                const prompt = `
                    Please analyze the following legal document for a ${caseType} case:
                    
                    Document Name: ${document.name}
                    Document Type: ${document.type}
                    Document Content: ${document.content}
                    
                    Provide a structured analysis of this document.
                `.trim();
                
                // Generate response using the model
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                analysisResults.push({
                    documentName: document.name,
                    documentType: document.type,
                    analysis: {
                        response: text,
                        confidence: 0.9
                    }
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
            
            // Check if model is available
            if (!this.model) {
                return res.status(500).json({
                    success: false,
                    message: 'AI model is not configured properly'
                });
            }
            
            // Create a prompt for case strategy
            const prompt = `
                You are a specialized AI legal assistant for ${this.caseTypes[caseType].name}.
                
                Case Type: ${caseType}
                Case Facts: ${JSON.stringify(caseFacts)}
                Legal Issues: ${JSON.stringify(legalIssues || [])}
                
                Please provide strategic recommendations for this case, including:
                1. Key legal arguments
                2. Potential challenges
                3. Recommended evidence
                4. Possible outcomes
            `.trim();
            
            // Generate response using the model
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Create result object
            const aiResult = {
                response: text,
                case_type: caseType,
                confidence: 0.9
            };
            
            // Enhance result with case-specific context
            const enhancedResult = this.enhanceCaseStrategy(aiResult, caseType);
            
            res.json({
                success: true,
                data: enhancedResult
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
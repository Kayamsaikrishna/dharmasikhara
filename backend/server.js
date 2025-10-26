const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');

// Import controllers
const LegalAIController = require('./ai_controller');
const aiController = new LegalAIController();

// Import courtroom controller
const CourtroomController = require('./src/controllers/courtroomController');
const courtroomController = new CourtroomController();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'AI Backend is running',
        timestamp: new Date().toISOString()
    });
});

// AI Model Status Endpoint
app.get('/api/ai-status', async (req, res) => {
    try {
        const isAvailable = await aiController.isModelAvailable();
        
        res.json({
            success: true,
            data: {
                modelAvailable: isAvailable,
                modelName: 'InCaseLawBERT',
                status: isAvailable ? 'Ready' : 'Unavailable'
            }
        });
    } catch (error) {
        console.error('AI status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check AI model status',
            error: error.message
        });
    }
});

// AI Document Analysis Endpoint
app.post('/api/analyze-document', async (req, res) => {
    try {
        const { documentText } = req.body;
        
        if (!documentText) {
            return res.status(400).json({
                success: false,
                message: 'Document text is required'
            });
        }
        
        // Analyze the document using the AI model
        const analysisResult = await aiController.analyzeDocument(documentText);
        
        if (analysisResult.error) {
            return res.status(500).json({
                success: false,
                message: 'AI analysis failed',
                error: analysisResult.error
            });
        }
        
        res.json({
            success: true,
            data: analysisResult
        });
    } catch (error) {
        console.error('Document analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during document analysis',
            error: error.message
        });
    }
});

// AI Legal Assistant Endpoint
app.post('/api/ai/legal-assistant', async (req, res) => {
    try {
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
        
        // Get response from the AI model
        const aiResponse = await aiController.getLegalAssistantResponse(fullQuery);
        
        if (aiResponse.error) {
            return res.status(500).json({
                success: false,
                message: 'AI response failed',
                error: aiResponse.error
            });
        }
        
        res.json({
            success: true,
            data: {
                response: aiResponse,
                legalCategory: 'general', // This would be determined by the AI model in a real implementation
                relatedConcepts: [], // This would be determined by the AI model in a real implementation
                confidence: 0.95 // This would be determined by the AI model in a real implementation
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
});

// Courtroom Endpoints
app.get('/api/courtroom/documents', (req, res) => {
    courtroomController.getCourtroomDocuments(req, res);
});

app.get('/api/courtroom/messages', (req, res) => {
    courtroomController.getCourtroomMessages(req, res);
});

app.post('/api/courtroom/respond', (req, res) => {
    courtroomController.getCourtroomResponse(req, res);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`DharmaSikhara AI Backend running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
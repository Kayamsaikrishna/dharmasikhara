const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Import controllers
const aiController = require('../controllers/aiController');

// AI Model Status Endpoint
router.get('/status', aiController.getAIStatus);

// AI Document Analysis Endpoint
router.post('/analyze-document', authenticateToken, aiController.analyzeDocument);

// Test endpoint for document analysis without authentication
router.post('/analyze-document-test', aiController.analyzeDocument);

// Get legal assistant response
router.post('/legal-assistant', aiController.getLegalAssistantResponse);

// Get comprehensive legal research
router.post('/legal-research', authenticateToken, aiController.getLegalResearch);

// Generate legal document draft
router.post('/generate-document', authenticateToken, aiController.generateLegalDocument);

// AI Document Analysis Streaming Endpoint (support both GET and POST)
router.get('/stream-analysis', authenticateToken, aiController.streamDocumentAnalysis);
router.post('/stream-analysis', authenticateToken, aiController.streamDocumentAnalysis);

// AI NPC System Endpoints
router.post('/npc-response', aiController.getNPCResponse);
router.post('/classify-document', aiController.classifyDocument);

module.exports = router;
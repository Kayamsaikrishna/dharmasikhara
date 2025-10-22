const express = require('express');
const router = express.Router();

// Import controllers
const aiController = require('../controllers/aiController');

// AI Model Status Endpoint
router.get('/status', aiController.getAIStatus);

// AI Document Analysis Endpoint
router.post('/analyze-document', aiController.analyzeDocument);

// AI Document Analysis Streaming Endpoint (support both GET and POST)
router.get('/stream-analysis', aiController.streamDocumentAnalysis);
router.post('/stream-analysis', aiController.streamDocumentAnalysis);

// AI NPC System Endpoints
router.post('/npc-response', aiController.getNPCResponse);
router.post('/classify-document', aiController.classifyDocument);

module.exports = router;
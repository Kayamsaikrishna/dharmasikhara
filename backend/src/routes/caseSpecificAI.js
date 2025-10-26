const express = require('express');
const router = express.Router();
const caseSpecificAIController = require('../controllers/caseSpecificAIController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get available case-specific AI models
router.get('/models', caseSpecificAIController.getAvailableModels);

// Get case-specific AI response
router.post('/response', authenticateToken, caseSpecificAIController.getCaseSpecificResponse);

// Analyze case documents with case-specific AI
router.post('/analyze-documents', authenticateToken, caseSpecificAIController.analyzeCaseDocuments);

// Get case strategy recommendations
router.post('/strategy', authenticateToken, caseSpecificAIController.getCaseStrategy);

module.exports = router;
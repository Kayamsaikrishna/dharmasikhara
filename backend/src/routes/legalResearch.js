const express = require('express');
const router = express.Router();
const legalResearchController = require('../controllers/legalResearchController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Search for similar cases (protected route)
router.post('/search', authenticateToken, legalResearchController.searchSimilarCases);

// Get case details by ID and source (protected route)
router.get('/case/:caseId/:source', authenticateToken, legalResearchController.getCaseDetails);

// Generate comprehensive legal research report (protected route)
router.post('/report', authenticateToken, legalResearchController.generateReport);

module.exports = router;
const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken, requireContractor } = require('../middleware/authMiddleware');

// Import controllers
const {
    getCreatorScenarios,
    getFeaturedScenarios,
    searchMarketplace,
    rateScenario
} = require('../controllers/contentController');

// Public routes
router.get('/featured', getFeaturedScenarios);
router.get('/creator/:creatorId', getCreatorScenarios);
router.get('/search', searchMarketplace);

// Protected routes (only for authenticated users)
router.use(authenticateToken);

// Scenario rating
router.post('/rate/:scenarioId', rateScenario);

module.exports = router;
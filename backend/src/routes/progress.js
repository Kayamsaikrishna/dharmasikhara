const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// Import controllers
const {
    saveUserProgress,
    getUserProgress,
    getAllUserProgress
} = require('../controllers/progressController');

// Progress routes
// Remove authentication middleware to allow unauthenticated access
router.post('/', saveUserProgress);
router.get('/:scenarioId', getUserProgress);
router.get('/', getAllUserProgress);

module.exports = router;
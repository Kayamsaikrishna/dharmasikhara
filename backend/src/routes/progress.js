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
router.post('/', authenticateToken, saveUserProgress);
router.get('/:scenarioId', authenticateToken, getUserProgress);
router.get('/', authenticateToken, getAllUserProgress);

module.exports = router;
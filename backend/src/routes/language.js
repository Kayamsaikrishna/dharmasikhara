const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get supported languages
router.get('/supported', languageController.getSupportedLanguages);

// Set user language preference (protected route)
router.put('/:userId/language', authenticateToken, languageController.setUserLanguage);

// Get user language preference (protected route)
router.get('/:userId/language', authenticateToken, languageController.getUserLanguage);

module.exports = router;
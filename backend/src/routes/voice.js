const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Convert text to speech (protected route)
router.post('/tts', authenticateToken, voiceController.textToSpeech);

// Get supported voices
router.get('/voices', voiceController.getVoices);

module.exports = router;
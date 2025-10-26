const express = require('express');
const router = express.Router();
const expertSupportController = require('../controllers/expertSupportController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all available experts
router.get('/experts', expertSupportController.getExperts);

// Get expert by ID
router.get('/experts/:expertId', expertSupportController.getExpertById);

// Schedule a session with an expert (protected route)
router.post('/sessions/schedule', authenticateToken, expertSupportController.scheduleSession);

// Get user's scheduled sessions (protected route)
router.get('/sessions/user/:userId', authenticateToken, expertSupportController.getUserSessions);

// Get expert's scheduled sessions (protected route)
router.get('/sessions/expert/:expertId', authenticateToken, expertSupportController.getExpertSessions);

// Cancel a session (protected route)
router.delete('/sessions/:sessionId', authenticateToken, expertSupportController.cancelSession);

// Submit feedback for a session (protected route)
router.post('/sessions/feedback', authenticateToken, expertSupportController.submitFeedback);

// Get upcoming sessions for a user (protected route)
router.get('/sessions/upcoming/:userId', authenticateToken, expertSupportController.getUpcomingSessions);

module.exports = router;
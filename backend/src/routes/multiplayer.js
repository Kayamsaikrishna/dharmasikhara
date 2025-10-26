const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// Import controllers
const {
    createGame,
    getGameById,
    getActiveGames,
    updateGame,
    deleteGame,
    findMatch,
    getMatchmakingStatus,
    sendChatMessage,
    submitAction,
    recordPlayerMetrics,
    getPlayerMetrics,
    getEvaluationReport
} = require('../controllers/multiplayerController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Multiplayer session routes
router.post('/sessions', createGame);
router.post('/sessions/:sessionId/join', (req, res) => {
    // This would be joinGame if it existed, but we'll use a placeholder
    res.status(501).json({ success: false, message: 'Not implemented' });
});
router.post('/sessions/:sessionId/leave', (req, res) => {
    // This would be leaveGame if it existed, but we'll use a placeholder
    res.status(501).json({ success: false, message: 'Not implemented' });
});
router.post('/sessions/:sessionId/start', (req, res) => {
    // This would be startSession if it existed, but we'll use a placeholder
    res.status(501).json({ success: false, message: 'Not implemented' });
});
router.post('/sessions/:sessionId/end', (req, res) => {
    // This would be endSession if it existed, but we'll use a placeholder
    res.status(501).json({ success: false, message: 'Not implemented' });
});
router.get('/sessions/:sessionId', getGameById);
router.get('/sessions', getActiveGames);

// Evaluation metrics routes
router.post('/metrics', recordPlayerMetrics);
router.get('/metrics/:playerId/:gameId', getPlayerMetrics);
router.get('/metrics/:playerId', getPlayerMetrics);
router.get('/evaluation/:gameId', getEvaluationReport);

module.exports = router;
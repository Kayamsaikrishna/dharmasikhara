const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken, requireContractor } = require('../middleware/authMiddleware');

// Import controllers
const {
    getAllScenarios,
    getScenarioById,
    createScenario,
    updateScenario,
    deleteScenario
} = require('../controllers/scenarioController');

// Public routes - now enabled to use actual controller functions
router.get('/', getAllScenarios);
router.get('/:id', getScenarioById);

// Protected routes (only for authenticated users)
router.use(authenticateToken);

// Contractor-only routes - disabled as per requirements
router.post('/', requireContractor, (req, res) => {
    res.status(403).json({
        success: false,
        message: 'Scenario creation is temporarily disabled'
    });
});
router.put('/:id', requireContractor, (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Scenario not found'
    });
});
router.delete('/:id', requireContractor, (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Scenario not found'
    });
});

module.exports = router;
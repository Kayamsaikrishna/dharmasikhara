const express = require('express');
const router = express.Router();

// Import controllers
const analyticsController = require('../controllers/analyticsController');

// Analytics routes
router.get('/user/:userId', analyticsController.getUserAnalytics);
router.get('/scenario/:scenarioId', analyticsController.getScenarioAnalytics);
router.get('/institution/:institutionId', analyticsController.getInstitutionAnalytics);

// Skill tracking
router.get('/skills/:userId', analyticsController.getUserSkills);
router.post('/skills/:userId/update', analyticsController.updateUserSkills);

// Reporting
router.get('/reports/:userId', analyticsController.generateUserReport);
router.get('/reports/institution/:institutionId', analyticsController.generateInstitutionReport);

module.exports = router;
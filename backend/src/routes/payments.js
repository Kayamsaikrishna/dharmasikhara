const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// Import controllers
const paymentController = require('../controllers/paymentController');

// Payment routes
router.post('/process', authenticateToken, paymentController.processPayment);
router.get('/history', authenticateToken, paymentController.getPaymentHistory);
router.get('/plans', paymentController.getSubscriptionPlans);

module.exports = router;
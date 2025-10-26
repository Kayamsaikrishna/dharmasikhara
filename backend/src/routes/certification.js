const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get available certifications
router.get('/', certificationController.getAvailableCertifications);

// Get user's earned certifications
router.get('/user/:userId', authenticateToken, certificationController.getUserCertifications);

// Check if user is eligible for a certification
router.get('/eligibility/:userId/:certificationId', authenticateToken, certificationController.checkCertificationEligibility);

// Issue a certificate to a user
router.post('/issue/:userId/:certificationId', authenticateToken, certificationController.issueCertificate);

// Verify a certificate
router.get('/verify/:certificateId', certificationController.verifyCertificate);

module.exports = router;
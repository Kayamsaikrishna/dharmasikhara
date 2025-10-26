const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get marketing content for the platform
router.get('/content', marketingController.getMarketingContent);

// Get promotional banners and announcements
router.get('/promotional', marketingController.getPromotionalContent);

// Track user engagement with marketing content
router.post('/track-engagement', marketingController.trackEngagement);

// Get content for SEO and social media
router.get('/seo', marketingController.getSEOContent);

// Get educational content and resources
router.get('/educational', marketingController.getEducationalContent);

// Get press and media information
router.get('/press', marketingController.getPressContent);

module.exports = router;
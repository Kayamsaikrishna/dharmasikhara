const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// Import controllers
const reviewsFaqController = require('../controllers/reviewsFaqController');

// Reviews routes
router.get('/reviews', reviewsFaqController.getAllReviews);
router.get('/reviews/scenario/:scenarioId', reviewsFaqController.getReviewsByScenarioId); // Add this new route
router.post('/reviews', authenticateToken, reviewsFaqController.createReview);
router.put('/reviews/:id', authenticateToken, reviewsFaqController.updateReview);
router.delete('/reviews/:id', authenticateToken, reviewsFaqController.deleteReview);

// FAQ routes
router.get('/faq', reviewsFaqController.getAllFAQs);
router.get('/faq/:id', reviewsFaqController.getFAQWithAnswers);
router.post('/faq', authenticateToken, reviewsFaqController.createFAQ);
router.post('/faq/:id/answers', authenticateToken, reviewsFaqController.answerFAQ);
router.delete('/faq/:id', authenticateToken, reviewsFaqController.deleteFAQ);

module.exports = router;
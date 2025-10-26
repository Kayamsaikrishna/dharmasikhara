const express = require('express');
const router = express.Router();
const legalNewsController = require('../controllers/legalNewsController');

// Get latest legal news
router.get('/', legalNewsController.getLegalNews);

// Get legal news by ID
router.get('/:id', legalNewsController.getLegalNewsById);

// Search legal news
router.get('/search', legalNewsController.searchLegalNews);

// Get legal news categories
router.get('/categories', legalNewsController.getLegalNewsCategories);

// Get bills and amendments
router.get('/bills', legalNewsController.getBillsAndAmendments);

// Get bill by ID
router.get('/bills/:id', legalNewsController.getBillById);

module.exports = router;
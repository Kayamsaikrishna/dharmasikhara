const express = require('express');
const router = express.Router();
const legalResearchController = require('../controllers/legalResearchController');

// Test route to check if routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Legal research routes are working' });
});

// Get all research documents
router.get('/documents', legalResearchController.getResearchDocuments);

// Get research document categories
router.get('/documents/categories', legalResearchController.getResearchDocumentCategories);

// Search research documents
router.get('/documents/search', legalResearchController.searchResearchDocuments);

// Serve document file
router.get('/documents/:category/:fileName', legalResearchController.serveDocumentFile);
router.get('/documents/:category/:lang/:fileName', legalResearchController.serveDocumentFile);

// Get research documents by category
router.get('/documents/category/:category', legalResearchController.getResearchDocumentsByCategory);

// Get research document by ID
router.get('/documents/:id', legalResearchController.getResearchDocumentById);

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for file uploads with memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// Import controllers
const accountController = require('../controllers/accountController');

// Account routes
router.get('/profile', authenticateToken, accountController.getProfile);
router.put('/profile', authenticateToken, accountController.updateProfile);
router.get('/documents', authenticateToken, accountController.getUserDocuments);
router.post('/documents', authenticateToken, accountController.uploadDocument);
router.delete('/documents/:id', authenticateToken, accountController.deleteDocument);
router.get('/subscription', authenticateToken, accountController.getSubscription);

module.exports = router;
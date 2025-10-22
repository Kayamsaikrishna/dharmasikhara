const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/userController');

// User routes
router.get('/:id', userController.getUserById);
router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/role', userController.updateUserRole); // Add role update route

// User progress and analytics
router.get('/:id/progress', userController.getUserProgress);
router.get('/:id/analytics', userController.getUserAnalytics);

module.exports = router;
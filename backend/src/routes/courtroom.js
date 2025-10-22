const express = require('express');
const router = express.Router();

// Import controllers
const CourtroomController = require('../controllers/courtroomController');
const courtroomController = new CourtroomController();

// Courtroom Endpoints
router.get('/documents', courtroomController.getCourtroomDocuments.bind(courtroomController));
router.get('/messages', courtroomController.getCourtroomMessages.bind(courtroomController));
router.post('/respond', courtroomController.getCourtroomResponse.bind(courtroomController));

module.exports = router;
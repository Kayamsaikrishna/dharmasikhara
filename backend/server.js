const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');

// Import controllers
const aiController = require('./src/controllers/aiController');

// Import courtroom controller
const CourtroomController = require('./src/controllers/courtroomController');
const courtroomController = new CourtroomController();

// Import routes
const aiRoutes = require('./src/routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// AI Routes
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'AI Backend is running',
        timestamp: new Date().toISOString()
    });
});

// AI Model Status Endpoint
app.get('/api/ai/status', aiController.getAIStatus);





// Courtroom Endpoints
app.get('/api/courtroom/documents', (req, res) => {
    courtroomController.getCourtroomDocuments(req, res);
});

app.get('/api/courtroom/messages', (req, res) => {
    courtroomController.getCourtroomMessages(req, res);
});

app.post('/api/courtroom/respond', (req, res) => {
    courtroomController.getCourtroomResponse(req, res);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`DharmaSikhara AI Backend running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
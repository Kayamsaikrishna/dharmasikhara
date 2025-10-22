const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ 
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const scenarioRoutes = require('./routes/scenarios');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');
const contentRoutes = require('./routes/content');
const multiplayerRoutes = require('./routes/multiplayer');
const accountRoutes = require('./routes/account');
const paymentRoutes = require('./routes/payments');
const evidenceRoutes = require('./routes/evidence');
const courtroomRoutes = require('./routes/courtroom');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/multiplayer', multiplayerRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/courtroom', courtroomRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'DharmaSikhara Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

// Load environment variables
require('dotenv').config();

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
const languageRoutes = require('./routes/language');
const voiceRoutes = require('./routes/voice');
const legalResearchRoutes = require('./routes/legalResearch');
const certificationRoutes = require('./routes/certification');
const expertSupportRoutes = require('./routes/expertSupport');
const caseSpecificAIRoutes = require('./routes/caseSpecificAI');
const marketingRoutes = require('./routes/marketing');
const legalNewsRoutes = require('./routes/legalNews');
// Assessment routes removed
// Legal updates routes removed
// Live sessions routes removed

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
// Use port 5002 as default to align with project configuration
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Serve evidence images from scenario 1 folder
app.use('/scenario 1/evidences folder', express.static(path.join(__dirname, '../../scenario 1/evidences folder')));

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
app.use('/api/language', languageRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/legal-research', legalResearchRoutes);
app.use('/api/certification', certificationRoutes);
app.use('/api/expert-support', expertSupportRoutes);
app.use('/api/case-specific-ai', caseSpecificAIRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/legal-news', legalNewsRoutes);
// Assessment routes removed
// Legal updates routes removed
// Live sessions routes removed

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
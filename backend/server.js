const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Redis = require('redis');
const { Client } = require('pg');
const elasticsearch = require('elasticsearch');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Import controllers
const aiController = require('./src/controllers/aiController');

// Import routes
const aiRoutes = require('./src/routes/ai');
const legalResearchRoutes = require('./src/routes/legalResearch');
const legalNewsRoutes = require('./src/routes/legalNews');
const accountRoutes = require('./src/routes/account');
const paymentRoutes = require('./src/routes/payments');
const userRoutes = require('./src/routes/users');
const scenarioRoutes = require('./src/routes/scenarios');
const analyticsRoutes = require('./src/routes/analytics');
const contentRoutes = require('./src/routes/content');
const multiplayerRoutes = require('./src/routes/multiplayer');
const evidenceRoutes = require('./src/routes/evidence');
const courtroomRoutes = require('./src/routes/courtroom');
const languageRoutes = require('./src/routes/language');
const voiceRoutes = require('./src/routes/voice');
const certificationRoutes = require('./src/routes/certification');
const expertSupportRoutes = require('./src/routes/expertSupport');
const caseSpecificAIRoutes = require('./src/routes/caseSpecificAI');
const marketingRoutes = require('./src/routes/marketing');
const progressRoutes = require('./src/routes/progress');
const authRoutes = require('./src/routes/auth');

// Import database service
const databaseService = require('./src/services/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Increase payload limit for document uploads
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));  // Increased from default to 50mb
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));  // Increased from default to 50mb

// AI Routes
app.use('/api/ai', aiRoutes);

// Legal Research Routes
app.use('/api/legal-research', legalResearchRoutes);

// Legal News Routes
app.use('/api/legal-news', legalNewsRoutes);

// Account Routes
app.use('/api/account', accountRoutes);

// Auth Routes
app.use('/api/auth', authRoutes);

// Payment Routes
app.use('/api/payments', paymentRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Scenario Routes
app.use('/api/scenarios', scenarioRoutes);

// Analytics Routes
app.use('/api/analytics', analyticsRoutes);

// Content Routes
app.use('/api/content', contentRoutes);

// Multiplayer Routes
app.use('/api/multiplayer', multiplayerRoutes);

// Evidence Routes
app.use('/api/evidence', evidenceRoutes);

// Courtroom Routes
app.use('/api/courtroom', courtroomRoutes);

// Language Routes
app.use('/api/language', languageRoutes);

// Voice Routes
app.use('/api/voice', voiceRoutes);

// Certification Routes
app.use('/api/certification', certificationRoutes);

// Expert Support Routes
app.use('/api/expert-support', expertSupportRoutes);

// Case Specific AI Routes
app.use('/api/case-specific-ai', caseSpecificAIRoutes);

// Marketing Routes
app.use('/api/marketing', marketingRoutes);

// Progress Routes
app.use('/api/progress', progressRoutes);

// Serve static files from scenario 1 evidences folder
app.use('/scenario%201/evidences%20folder', express.static(path.join(__dirname, '../scenario 1/evidences folder')));

// AI Model Status Endpoint
app.get('/api/ai/status', aiController.getAIStatus);

// Courtroom Endpoints
app.get('/api/courtroom/documents', (req, res) => {
    // Mock data for now
    res.json({
        success: true,
        data: [
            { id: '1', title: 'Case Document 1', type: 'pdf', url: '/documents/case1.pdf' },
            { id: '2', title: 'Case Document 2', type: 'pdf', url: '/documents/case2.pdf' }
        ]
    });
});

app.post('/api/courtroom/response', (req, res) => {
    const { userInput } = req.body;
    // Mock response for now
    res.json({
        success: true,
        data: {
            response: `I understand you're asking about: ${userInput}. This is a mock response from the courtroom AI.`
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Connect to all databases before starting the server
// Note: We continue starting the server even if database connections fail
// to allow basic functionality without databases
databaseService.connectAll()
  .then(() => {
    console.log('Database connection attempts completed');
  })
  .catch((error) => {
    console.error('Database connection error (continuing without databases):', error);
  })
  .finally(() => {
    // Start the server regardless of database connection status
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`DharmaSikhara AI Backend running on http://0.0.0.0:${PORT}`);
        console.log('WARNING: Some features may be limited due to missing database connections');
    });
  });
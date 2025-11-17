// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Import controllers
const aiController = require('./controllers/geminiAIController');

// Import routes
const aiRoutes = require('./routes/ai');
const legalResearchRoutes = require('./routes/legalResearch');
const accountRoutes = require('./routes/account');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const scenarioRoutes = require('./routes/scenarios');
const contentRoutes = require('./routes/content');
const evidenceRoutes = require('./routes/evidence');
const certificationRoutes = require('./routes/certification');
const progressRoutes = require('./routes/progress');

// Import database service
const databaseService = require('./services/database');

const app = express();
// Use environment port or default to 5000
const PORT = process.env.PORT || 5000;

// Increase payload limit for document uploads
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Reduced from 50mb to 10mb
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Reduced from 50mb to 10mb

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve static files from scenario 1 evidences folder
app.use('/scenario%201/evidences%20folder', express.static(path.join(__dirname, '../../scenario 1/evidences folder')));

// Serve static files from research directory
app.use('/research', express.static(path.join(__dirname, '../../research')));

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/legal-research', legalResearchRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/certification', certificationRoutes);
app.use('/api/progress', progressRoutes);

// Health check endpoint for cPanel
app.get('/health', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send('<html><body><h1>Application is running</h1></body></html>');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Connect to SQLite database before starting the server
databaseService.connectAll()
  .then(() => {
    console.log('All database connections established successfully');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  })
  .finally(() => {
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`DharmaSikhara AI Backend running on http://0.0.0.0:${PORT}`);
        console.log('SQLite database is ready for use');
    });
    
    // Handle server errors
    server.on('error', (err) => {
        console.error('Server error:', err);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      try {
        // Close SQLite database connection
        const sqliteDb = databaseService.getSQLite();
        if (sqliteDb) {
          // SQLite connection will be closed automatically when process exits
          console.log('SQLite database connection closed');
        }
        server.close(() => {
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      try {
        // Close SQLite database connection
        const sqliteDb = databaseService.getSQLite();
        if (sqliteDb) {
          // SQLite connection will be closed automatically when process exits
          console.log('SQLite database connection closed');
        }
        server.close(() => {
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => {
        process.exit(1);
      });
    });
  });
// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');

// Memory monitoring
const os = require('os');

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
const reviewsFaqRoutes = require('./routes/reviewsFaq');

// Import database service
const databaseService = require('./services/database');

const app = express();
// Use environment port or default to 5000
const PORT = process.env.PORT || 5000;

// Optimize payload limits for memory efficiency in production
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' })); // Further reduced to 5mb for better memory management
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true })); // Further reduced to 5mb for better memory management

// Memory monitoring middleware
app.use((req, res, next) => {
  // Log memory usage for monitoring
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  
  // Log if memory usage is high (> 80%)
  if (used.heapUsed / used.heapTotal > 0.8) {
    console.warn(`⚠️ High memory usage - Heap: ${heapUsedMB} MB / ${heapTotalMB} MB`);
  }
  
  // Reject requests if memory usage is critical (> 90%)
  if (used.heapUsed / used.heapTotal > 0.9) {
    console.error(`❌ Critical memory usage - Heap: ${heapUsedMB} MB / ${heapTotalMB} MB`);
    // Suggest garbage collection
    if (global.gc) {
      global.gc();
    }
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable due to high memory usage. Please try again later.'
    });
  }
  
  next();
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve static files from scenario 1 evidences folder
app.use('/scenario%201/evidences%20folder', express.static(path.join(__dirname, '../../scenario 1/evidences folder')));

// Serve static files from public evidence folder
app.use('/evidence', express.static(path.join(__dirname, '../public/evidence')));

// Serve static files directly from scenario 1 evidences folder with proper URL encoding
app.use('/api/evidence/images', express.static(path.join(__dirname, '../../scenario 1/evidences folder')));

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
app.use('/api/community', reviewsFaqRoutes);

// Health check endpoint for cPanel
app.get('/health', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send('<html><body><h1>Application is running</h1></body></html>');
});

// Health check endpoint with memory info
app.get('/api/health', (req, res) => {
    const memUsage = process.memoryUsage();
    const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
    
    // Suggest garbage collection if available
    if (global.gc) {
        global.gc();
    }
    
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        memory: {
            heapUsedMB: heapUsed,
            heapTotalMB: heapTotal,
            usagePercent: Math.round((heapUsed / heapTotal) * 100)
        }
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
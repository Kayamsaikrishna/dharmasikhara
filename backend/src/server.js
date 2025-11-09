const app = require('./app');
const databaseService = require('./services/database');

// Use environment port or default to 5003
const PORT = process.env.PORT || 5003;

// Connect to SQLite database before starting the server
databaseService.connectAll()
  .then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`DharmaSikhara Backend running on http://0.0.0.0:${PORT}`);
      console.log('Using localized SQLite database at: backend/dharmasikhara.db');
    });
    
    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to database connection error:', error);
    process.exit(1);
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
    process.exit(0);
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
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
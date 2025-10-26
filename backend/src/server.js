const app = require('./app');
const databaseService = require('./services/database');

const PORT = process.env.PORT || 5001;

// Connect to all databases before starting the server
databaseService.connectAll()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`DharmaSikhara Backend running on http://0.0.0.0:${PORT}`);
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
    if (databaseService.getMongoDB()) {
      await databaseService.getMongoDB().connection.close();
    }
    if (databaseService.getRedis()) {
      await databaseService.getRedis().quit();
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
    if (databaseService.getMongoDB()) {
      await databaseService.getMongoDB().connection.close();
    }
    if (databaseService.getRedis()) {
      await databaseService.getRedis().quit();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
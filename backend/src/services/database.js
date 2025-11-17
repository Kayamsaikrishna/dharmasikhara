const sqliteDatabase = require('./sqliteDatabase');

class DatabaseService {
  constructor() {
    this.sqlite = null;
  }

  async connectAll() {
    try {
      this.sqlite = await sqliteDatabase.connect();
      console.log('SQLite database connected successfully');
      
      // Create community tables
      await sqliteDatabase.createCommunityTables();
      console.log('Community tables created successfully');
      
      return this.sqlite;
    } catch (error) {
      console.error('SQLite database connection error:', error.message);
      throw error;
    }
  }

  getSQLite() {
    return this.sqlite;
  }

  // Expose SQLite database methods directly
  async saveUserProgress(progressData) {
    return await sqliteDatabase.saveUserProgress(progressData);
  }

  async getUserProgress(userId, scenarioId) {
    return await sqliteDatabase.getUserProgress(userId, scenarioId);
  }

  async getAllUserProgress(userId) {
    return await sqliteDatabase.getAllUserProgress(userId);
  }

  // Proxy methods for backward compatibility - all return SQLite instance
  getMongoDB() {
    return this.sqlite;
  }

  getPostgreSQL() {
    return this.sqlite;
  }

  getRedis() {
    return this.sqlite;
  }
}

module.exports = new DatabaseService();
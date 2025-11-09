const sqliteDatabase = require('./sqliteDatabase');

class DatabaseService {
  constructor() {
    this.sqlite = null;
  }

  async connectAll() {
    try {
      this.sqlite = await sqliteDatabase.connect();
      console.log('SQLite database connected successfully');
      return this.sqlite;
    } catch (error) {
      console.error('SQLite database connection error:', error.message);
      throw error;
    }
  }

  getSQLite() {
    return this.sqlite;
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

  getElasticsearch() {
    return this.sqlite;
  }
}

module.exports = new DatabaseService();
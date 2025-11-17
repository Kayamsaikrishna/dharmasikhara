const Database = require('better-sqlite3');
const path = require('path');

class SQLiteDatabaseService {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      // Create or connect to SQLite database file
      const dbPath = path.join(__dirname, '../../dharmasikhara.db');
      this.db = new Database(dbPath);
      
      console.log('Connected to SQLite database at:', dbPath);

      // Enable foreign keys
      this.db.exec('PRAGMA foreign_keys = ON');

      // Create tables if they don't exist
      this.createTables();
      
      return this.db;
    } catch (error) {
      console.error('SQLite connection error:', error.message);
      throw error;
    }
  }

  createTables() {
    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        institution TEXT,
        year TEXT,
        specialization TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create a default anonymous user if it doesn't exist
    this.db.exec(`
      INSERT OR IGNORE INTO users (id, username, email, password) 
      VALUES (0, 'anonymous', 'anonymous@example.com', 'anonymous')
    `);
    console.log('Anonymous user ensured in database');

    // Create scenarios table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scenarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_progress table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        scenario_id INTEGER,
        status TEXT DEFAULT 'not_started',
        progress INTEGER DEFAULT 0,
        completed_stages TEXT,
        score INTEGER,
        time_spent INTEGER DEFAULT 0,
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completion_date DATETIME
      )
    `);

    // Create documents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        content TEXT,
        file_type TEXT,
        file_size INTEGER,
        analysis_results TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_analyzed DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create payments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        payment_method TEXT,
        payment_id TEXT UNIQUE,
        status TEXT DEFAULT 'pending',
        plan TEXT,
        features TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create subscriptions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        plan TEXT,
        status TEXT DEFAULT 'active',
        start_date DATETIME,
        end_date DATETIME,
        features TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create community tables
    this.createCommunityTables();
  }

  createCommunityTables() {
    // Create reviews table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        scenario_id INTEGER,
        rating INTEGER,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create FAQ table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS faq (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        question TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create FAQ answers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS faq_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faq_id INTEGER,
        user_id INTEGER,
        answer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faq_id) REFERENCES faq (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
  }

  // User operations
  createUser(userData) {
    const { username, email, password } = userData;
    const stmt = this.db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const info = stmt.run(username, email, password);
    return { id: info.lastInsertRowid, ...userData };
  }

  getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  getUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  // Scenario operations
  createScenario(scenarioData) {
    const { title, description, content } = scenarioData;
    const stmt = this.db.prepare('INSERT INTO scenarios (title, description, content) VALUES (?, ?, ?)');
    const info = stmt.run(title, description, content);
    return { id: info.lastInsertRowid, ...scenarioData };
  }

  getAllScenarios() {
    const stmt = this.db.prepare('SELECT * FROM scenarios');
    return stmt.all();
  }

  getScenarioById(id) {
    const stmt = this.db.prepare('SELECT * FROM scenarios WHERE id = ?');
    return stmt.get(id);
  }

  // Progress operations
  saveUserProgress(progressData) {
    const { userId, scenarioId, status, progress, completedStages, score, timeSpent, feedback, completionDate } = progressData;
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_progress 
      (user_id, scenario_id, status, progress, completed_stages, score, time_spent, feedback, completion_date, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const info = stmt.run(
      userId, 
      scenarioId, 
      status, 
      progress, 
      JSON.stringify(completedStages || []), 
      score, 
      timeSpent, 
      feedback, 
      completionDate
    );
    
    return { id: info.lastInsertRowid, ...progressData };
  }

  getUserProgress(userId, scenarioId) {
    const stmt = this.db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND scenario_id = ?');
    const row = stmt.get(userId, scenarioId);
    
    // Parse completed_stages if it exists
    if (row && row.completed_stages) {
      try {
        row.completed_stages = JSON.parse(row.completed_stages);
      } catch (e) {
        row.completed_stages = [];
      }
    }
    
    return row;
  }

  getAllUserProgress(userId) {
    const stmt = this.db.prepare('SELECT * FROM user_progress WHERE user_id = ?');
    const rows = stmt.all(userId);
    
    // Parse completed_stages for each row if it exists
    return rows.map(row => {
      if (row && row.completed_stages) {
        try {
          row.completed_stages = JSON.parse(row.completed_stages);
        } catch (e) {
          row.completed_stages = [];
        }
      }
      return row;
    });
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('SQLite database connection closed');
    }
  }
}

module.exports = new SQLiteDatabaseService();
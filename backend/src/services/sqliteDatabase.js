const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SQLiteDatabaseService {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      // Create or connect to SQLite database file
      const dbPath = path.join(__dirname, '../../dharmasikhara.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('SQLite connection error:', err.message);
        } else {
          console.log('Connected to SQLite database at:', dbPath);
        }
      });

      // Enable foreign keys
      this.db.run('PRAGMA foreign_keys = ON');

      // Create tables if they don't exist
      await this.createTables();
      
      return this.db;
    } catch (error) {
      console.error('SQLite connection error:', error.message);
      throw error;
    }
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      // Create users table
      this.db.run(`
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
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create scenarios table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS scenarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Create user_progress table
          this.db.run(`
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
              completion_date DATETIME,
              FOREIGN KEY (user_id) REFERENCES users (id),
              FOREIGN KEY (scenario_id) REFERENCES scenarios (id)
            )
          `, (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Create documents table
            this.db.run(`
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
            `, (err) => {
              if (err) {
                reject(err);
                return;
              }

              // Create payments table
              this.db.run(`
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
              `, (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                // Create subscriptions table
                this.db.run(`
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
                `, (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              });
            });
          });
        });
      });
    });
  }

  // User operations
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password } = userData;
      this.db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...userData });
          }
        }
      );
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Scenario operations
  async createScenario(scenarioData) {
    return new Promise((resolve, reject) => {
      const { title, description, content } = scenarioData;
      this.db.run(
        'INSERT INTO scenarios (title, description, content) VALUES (?, ?, ?)',
        [title, description, content],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...scenarioData });
          }
        }
      );
    });
  }

  async getAllScenarios() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM scenarios', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getScenarioById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM scenarios WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Progress operations
  async saveUserProgress(progressData) {
    return new Promise((resolve, reject) => {
      const { userId, scenarioId, status, progress, completedStages, score, timeSpent, feedback, completionDate } = progressData;
      this.db.run(
        `INSERT OR REPLACE INTO user_progress 
         (user_id, scenario_id, status, progress, completed_stages, score, time_spent, feedback, completion_date, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, scenarioId, status, progress, JSON.stringify(completedStages || []), score, timeSpent, feedback, completionDate],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...progressData });
          }
        }
      );
    });
  }

  async getUserProgress(userId, scenarioId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM user_progress WHERE user_id = ? AND scenario_id = ?',
        [userId, scenarioId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            // Parse completed_stages if it exists
            if (row && row.completed_stages) {
              try {
                row.completed_stages = JSON.parse(row.completed_stages);
              } catch (e) {
                row.completed_stages = [];
              }
            }
            resolve(row);
          }
        }
      );
    });
  }

  async getAllUserProgress(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM user_progress WHERE user_id = ?',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            // Parse completed_stages for each row if it exists
            const parsedRows = rows.map(row => {
              if (row && row.completed_stages) {
                try {
                  row.completed_stages = JSON.parse(row.completed_stages);
                } catch (e) {
                  row.completed_stages = [];
                }
              }
              return row;
            });
            resolve(parsedRows);
          }
        }
      );
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('SQLite database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new SQLiteDatabaseService();
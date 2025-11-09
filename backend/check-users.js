const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.join(__dirname, 'dharmasikhara.db');
const db = new sqlite3.Database(dbPath);

async function checkUsers() {
  try {
    // Query all users from SQLite database
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    console.log(`Found ${users.length} users`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Created At: ${user.created_at}`);
      });
    } else {
      console.log('No users found in the database');
    }
    
    // Close database connection
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    db.close();
    process.exit(1);
  }
}

checkUsers();
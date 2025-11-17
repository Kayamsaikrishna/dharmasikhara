const Database = require('better-sqlite3');
const path = require('path');

// Connect to SQLite database
const dbPath = path.join(__dirname, 'dharmasikhara.db');
const db = new Database(dbPath);

function checkUsers() {
  try {
    // Query all users from SQLite database
    const users = db.prepare('SELECT * FROM users').all();
    
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
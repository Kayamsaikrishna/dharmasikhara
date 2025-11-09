/**
 * Initialize SQLite Database
 * 
 * This script initializes the SQLite database with sample data
 * for testing the localized database setup.
 */

const sqliteDatabase = require('./src/services/sqliteDatabase');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    console.log('Initializing SQLite database...');
    
    // Connect to database
    await sqliteDatabase.connect();
    
    // Create a sample user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const user = await sqliteDatabase.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword
    });
    
    console.log('Created sample user:', user);
    
    // Create a sample scenario
    const scenario = await sqliteDatabase.createScenario({
      title: 'The Inventory That Changed Everything',
      description: 'A legal scenario about contract disputes over inventory management',
      content: JSON.stringify({
        introduction: "Welcome to the scenario...",
        stages: [
          {
            id: 1,
            name: "Case Introduction",
            content: "Review the case details..."
          },
          {
            id: 2,
            name: "Evidence Analysis",
            content: "Analyze the evidence..."
          },
          {
            id: 3,
            name: "Legal Research",
            content: "Research relevant laws..."
          },
          {
            id: 4,
            name: "Courtroom Simulation",
            content: "Present your arguments..."
          },
          {
            id: 5,
            name: "Legal Assessment",
            content: "Complete competency assessment..."
          }
        ]
      })
    });
    
    console.log('Created sample scenario:', scenario);
    
    // Create sample progress
    const progress = await sqliteDatabase.saveUserProgress({
      user_id: user.id,
      scenario_id: scenario.id,
      progress_data: JSON.stringify({
        currentStage: 1,
        completedStages: [],
        startTime: new Date().toISOString()
      }),
      completed: false
    });
    
    console.log('Created sample progress:', progress);
    
    console.log('Database initialization completed successfully!');
    console.log('Database file created at: backend/dharmasikhara.db');
    console.log('You can now run the backend with: npm run dev');
    
    // Close connection
    await sqliteDatabase.close();
    
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
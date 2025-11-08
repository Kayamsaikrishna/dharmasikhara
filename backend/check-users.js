const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dharmasikhara', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkUsers() {
  try {
    // Find all users
    const users = await User.find({});
    
    console.log(`Found ${users.length} users`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Created At: ${user.createdAt}`);
        console.log(`  First Name: ${user.firstName}`);
        console.log(`  Last Name: ${user.lastName}`);
        console.log(`  Institution: ${user.institution}`);
        console.log(`  Year: ${user.year}`);
        console.log(`  Specialization: ${user.specialization}`);
      });
    } else {
      console.log('No users found in the database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

checkUsers();
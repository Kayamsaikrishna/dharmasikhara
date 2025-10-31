const mongoose = require('mongoose');

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/dharmasikhara';
mongoose.connect(mongoURI);

const User = require('./src/models/User');

async function checkUsers() {
  try {
    // Check if the specific user exists
    const user = await User.findOne({
      $or: [
        { email: 'kayamsaikrishna@gmail.com' },
        { username: 'krishna' }
      ]
    });
    
    if (user) {
      console.log('User still exists:');
      console.log(`- ${user.username} (${user.email})`);
    } else {
      console.log('User with email kayamsaikrishna@gmail.com or username krishna has been successfully removed');
    }
    
    // Count total users
    const totalUsers = await User.countDocuments();
    console.log(`\nTotal users in database: ${totalUsers}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
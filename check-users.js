const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dharmasikhara';
mongoose.connect(mongoURI);

// User model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['client'],
    default: 'client'
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  institution: {
    type: String,
    trim: true
  },
  year: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    const users = await User.find({});
    console.log('Existing users:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email})`);
    });
    
    console.log(`\nTotal users: ${users.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
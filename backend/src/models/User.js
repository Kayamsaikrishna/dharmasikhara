const mongoose = require('mongoose');

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
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as']
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark']
    }
  },
  proficiency: {
    criminalLaw: {
      type: Number,
      default: 50
    },
    civilLaw: {
      type: Number,
      default: 50
    },
    constitutionalLaw: {
      type: Number,
      default: 50
    },
    corporateLaw: {
      type: Number,
      default: 50
    },
    familyLaw: {
      type: Number,
      default: 50
    }
  }
});

module.exports = mongoose.model('User', userSchema);
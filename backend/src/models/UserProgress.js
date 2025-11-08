const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scenario: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
    ref: 'Scenario',
    required: false // Made optional to allow string scenario IDs
  },
  scenarioSlug: {
    type: String,
    required: false // For string-based scenario identifiers
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  startDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  feedback: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a custom validation to ensure either scenario or scenarioSlug is provided
userProgressSchema.pre('validate', function(next) {
  if (!this.scenario && !this.scenarioSlug) {
    next(new Error('Either scenario (ObjectId) or scenarioSlug (String) must be provided'));
  } else {
    next();
  }
});

module.exports = mongoose.model('UserProgress', userProgressSchema);
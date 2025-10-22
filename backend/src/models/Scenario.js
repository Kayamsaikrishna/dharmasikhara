const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  practiceArea: {
    type: String,
    required: true,
    enum: ['Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law', 'Constitutional Law', 'Tax Law', 'Intellectual Property']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true
  },
  learningObjectives: [{
    type: String
  }],
  content: {
    introduction: String,
    initialState: {
      characters: [{
        id: String,
        name: String,
        role: String,
        personality: String
      }],
      documents: [{
        id: String,
        title: String,
        type: String
      }]
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  price: {
    type: Number, // in points
    default: 0
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published', 'archived'],
    default: 'draft'
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

module.exports = mongoose.model('Scenario', scenarioSchema);
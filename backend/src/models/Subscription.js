const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'advanced', 'premium'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  features: {
    documentAnalysis: {
      type: Boolean,
      default: true
    },
    scenariosAccess: {
      type: Number, // Number of scenarios allowed per month
      default: 0
    },
    multiplayerAccess: {
      type: Boolean,
      default: false
    },
    customScenarios: {
      type: Number, // Number of custom scenarios allowed per month
      default: 0
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    storage: {
      type: String,
      default: '0 GB'
    },
    documentAnalysisLimit: {
      type: String,
      default: '0 per week'
    }
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
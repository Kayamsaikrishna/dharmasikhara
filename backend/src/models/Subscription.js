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

// Subscription model for SQLite database
// This is a placeholder module to maintain compatibility with existing code structure

class Subscription {
  constructor(data) {
    Object.assign(this, data);
  }

  static async find(query) {
    // This method is no longer used as we've moved to direct SQLite queries
    // in the controller. Keeping for backward compatibility.
    return [];
  }

  static async findOne(query) {
    // This method is no longer used as we've moved to direct SQLite queries
    // in the controller. Keeping for backward compatibility.
    return null;
  }

  static async findById(id) {
    // This method is no longer used as we've moved to direct SQLite queries
    // in the controller. Keeping for backward compatibility.
    return null;
  }

  save() {
    // This method is no longer used as we've moved to direct SQLite queries
    // in the controller. Keeping for backward compatibility.
    return Promise.resolve(this);
  }
}

module.exports = Subscription;

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['text', 'pdf'],
    required: true
  },
  fileSize: {
    type: Number
  },
  analysisResults: {
    type: mongoose.Schema.Types.Mixed
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastAnalyzed: {
    type: Date
  }
});

module.exports = mongoose.model('Document', documentSchema);
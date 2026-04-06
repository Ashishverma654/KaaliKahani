const mongoose = require('mongoose');

const ReadingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

ReadingProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', ReadingProgressSchema);

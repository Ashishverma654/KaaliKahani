const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// ENFORCE UNIQUE LIKES: One user can only like a specific story exactly once based on constraints limits.
LikeSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);

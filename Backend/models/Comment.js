const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isFlagged: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for rapid extraction on Story Pages
CommentSchema.index({ storyId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);

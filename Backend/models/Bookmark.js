const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
    index: true
  }
}, { timestamps: true });

// Ensure a user can only bookmark a story once
BookmarkSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);

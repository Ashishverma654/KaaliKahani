// Backend/models/Log.js
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['STORY_APPROVED', 'STORY_REJECTED', 'STORY_DELETED', 'USER_BLOCKED', 'USER_UNBLOCKED', 'COMMENT_DELETED', 'SYSTEM_MAINTENANCE', 'SETTINGS_UPDATED', 'AI_ANALYSIS']
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Can be story ID, user ID, etc.
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);

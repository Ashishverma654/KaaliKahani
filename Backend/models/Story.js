const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  title: {
    en: { type: String },
    hi: { type: String }
  },
  slug: {
    en: { type: String, sparse: true, unique: true },
    hi: { type: String, sparse: true, unique: true }
  },
  content: {
    en: { type: String },
    hi: { type: String }
  },
  originalContent: {
    en: { type: String },
    hi: { type: String }
  },
  language: [{
    type: String,
    enum: ['en', 'hi'],
    default: ['en']
  }],
  images: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['real-horror', 'paranormal', 'haunted-places', 'urban-legends', 'general-horror'],
    default: 'general-horror',
    index: true
  },
  aiSuggestions: {
    title: {
      en: { type: String },
      hi: { type: String }
    },
    content: {
      en: { type: String },
      hi: { type: String }
    },
    realismScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number,
    default: 1
  },
  approvedAt: {
    type: Date
  }
}, { timestamps: true });

// Optimize query routing: Fetch by Status and Date
StorySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Story', StorySchema);

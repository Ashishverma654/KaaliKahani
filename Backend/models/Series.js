const mongoose = require('mongoose');

const SeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['fantasy', 'real-story', 'fiction', 'spiritual', 'horror', 'romance', 'sci-fi', 'thriller', 'other',
           'real-horror', 'paranormal', 'haunted-places', 'urban-legends', 'general-horror'],
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

SeriesSchema.index({ author: 1, createdAt: -1 });
SeriesSchema.index({ category: 1 });

module.exports = mongoose.model('Series', SeriesSchema);

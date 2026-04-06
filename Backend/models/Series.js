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
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

SeriesSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Series', SeriesSchema);

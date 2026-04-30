const mongoose = require('mongoose');

/**
 * Archival Settings Registry
 * A singleton schema for site-wide narrative control.
 */
const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'KaaliKahani'
  },
  tagline: {
    type: String,
    default: 'Ghost stories that haunt your soul'
  },
  featuredStoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    default: null
  },
  autoApproveStories: {
    type: Boolean,
    default: false
  },
  profanityFilter: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Ensure only one settings document exists (Singleton Protocol)
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);

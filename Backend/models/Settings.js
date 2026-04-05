const mongoose = require('mongoose');

/**
 * Archival Settings Registry
 * A singleton schema for site-wide narrative control.
 */
const SettingsSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowAIAnalysis: {
    type: Boolean,
    default: true
  },
  archivePublicAccess: {
    type: Boolean,
    default: true
  },
  curatorApprovalThreshold: {
    type: Number,
    default: 1 // Minimum approvals before publishing
  },
  siteTitle: {
    type: String,
    default: 'KaaliKahani'
  },
  archivalAlerts: [{
    type: String, // Dynamic alerts displayed globally
  }]
}, { timestamps: true });

// Ensure only one settings document exists (Singleton Protocol map)
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);

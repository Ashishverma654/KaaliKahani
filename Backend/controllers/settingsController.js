const Settings = require('../models/Settings');
const formatResponse = require('../utils/response');

/**
 * Public site heartbeat (Maintenance Mode Only)
 */
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne().select('maintenanceMode featuredStoryId');
    return formatResponse(res, 200, 'Public settings retrieved', {
      maintenanceMode: settings?.maintenanceMode || false,
      featuredStoryId: settings?.featuredStoryId || null
    });
  } catch (error) {
    next(error);
  }
};

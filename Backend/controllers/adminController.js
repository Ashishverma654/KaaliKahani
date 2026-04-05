const Story = require('../models/Story');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Log = require('../models/Log');
const Settings = require('../models/Settings');
const formatResponse = require('../utils/response');

// Helper to log administrative actions
const createAuditLog = async (adminId, action, details, targetId = null) => {
  try {
    await Log.create({
      action,
      admin: adminId,
      targetId,
      details
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      Story.countDocuments(),
      Story.countDocuments({ status: 'pending' }),
      Story.countDocuments({ status: 'approved' }),
      User.countDocuments(),
      Comment.countDocuments()
    ]);

    const [totalStories, pendingSubmissions, approvedStories, totalUsers, totalComments] = stats;

    return formatResponse(res, 200, 'Dashboard statistics loaded', {
      totalStories,
      pendingSubmissions,
      approvedStories,
      totalUsers,
      totalComments,
      growth: 8.4 // Placeholder for actual growth calculation logic
    });
  } catch (error) {
    next(error);
  }
};

exports.getStories = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'name email');
    
    return formatResponse(res, 200, 'Stories loaded', stories);
  } catch (error) {
    next(error);
  }
};

exports.getPendingStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('author', 'name email');
      
    return formatResponse(res, 200, 'Pending stories loaded', stories);
  } catch (error) {
    next(error);
  }
};

exports.approveStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return formatResponse(res, 404, 'Story not found');
    
    story.status = 'approved';
    story.isPublished = true;
    story.approvedAt = Date.now();
    await story.save();

    await createAuditLog(req.user._id, 'STORY_APPROVED', `Approved story: ${story.title}`, story._id);

    return formatResponse(res, 200, 'Story approved and published successfully', story);
  } catch (error) {
    next(error);
  }
};

exports.rejectStory = async (req, res, next) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, {
      status: 'rejected',
      isPublished: false
    }, { new: true });
    
    if (!story) return formatResponse(res, 404, 'Story not found');

    await createAuditLog(req.user._id, 'STORY_REJECTED', `Rejected story: ${story.title}`, story._id);

    return formatResponse(res, 200, 'Story rejected securely', story);
  } catch (error) {
    next(error);
  }
};

exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return formatResponse(res, 404, 'Story not found');

    await createAuditLog(req.user._id, 'STORY_DELETED', `Deleted story: ${story.title}`, story._id);

    return formatResponse(res, 200, 'Story purged permanently');
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return formatResponse(res, 200, 'Users loaded', users);
  } catch (error) {
    next(error);
  }
};

exports.toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return formatResponse(res, 404, 'User not found');

    user.isActive = !user.isActive;
    await user.save();

    const action = user.isActive ? 'USER_UNBLOCKED' : 'USER_BLOCKED';
    await createAuditLog(req.user._id, action, `${action.toLowerCase()} user: ${user.email}`, user._id);

    return formatResponse(res, 200, `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`, user);
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'name email')
      .populate('story', 'title')
      .sort({ createdAt: -1 });
    return formatResponse(res, 200, 'Comments loaded', comments);
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await Log.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    return formatResponse(res, 200, 'Audit logs loaded', logs);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Archival Settings Retrieval
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne() || await Settings.create({});
    return formatResponse(res, 200, 'Archival settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update site-wide Archival Parameters
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    
    await createAuditLog(req.user._id, 'SETTINGS_UPDATED', 'Updated site-wide archival parameters');

    return formatResponse(res, 200, 'Archival parameters updated', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Public site heartbeat (Maintenance Mode Only)
 */
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne().select('maintenanceMode');
    return formatResponse(res, 200, 'Public archival status retrieved', {
      maintenanceMode: settings?.maintenanceMode || false
    });
  } catch (error) {
    next(error);
  }
};

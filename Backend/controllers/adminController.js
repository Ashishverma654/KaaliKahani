const Story = require('../models/Story');
const User = require('../models/User');
const Comment = require('../models/Comment');
const formatResponse = require('../utils/response');

/**
 * Fetch all stories for moderation
 */
exports.getAllStories = async (req, res, next) => {
  try {
    const stories = await Story.find()
      .populate('author', 'name email avatar')
      .sort('-createdAt');
    
    return formatResponse(res, 200, 'All stories fetched for moderation', stories);
  } catch (error) {
    next(error);
  }
};

/**
 * Update story status (Approve/Reject)
 */
exports.updateStoryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'draft'].includes(status)) {
      return formatResponse(res, 400, 'Invalid status update request');
    }

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!story) {
      return formatResponse(res, 404, 'Story not found in archives');
    }

    // Automatically toggle isPublished if approved
    if (status === 'approved') {
      story.isPublished = true;
      story.approvedAt = new Date();
      await story.save();
    }

    return formatResponse(res, 200, `Story status updated to ${status}`, story);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all users for administration
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    return formatResponse(res, 200, 'User registry fetched successfully', users);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle User Activation Status (Ban/Unban)
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return formatResponse(res, 404, 'User not found in registry');
    }

    // Prevention: Cannot deactivate yourself map map
    if (user._id.toString() === req.user._id.toString()) {
      return formatResponse(res, 400, 'Administrative conflict: Cannot deactivate your own account');
    }

    user.isActive = !user.isActive;
    await user.save();

    return formatResponse(res, 200, `User ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}`, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Dashboard Statistics
 */
exports.getStats = async (req, res, next) => {
  try {
    const [totalStories, pendingStories, activeUsers, totalComments] = await Promise.all([
      Story.countDocuments(),
      Story.countDocuments({ status: 'pending' }),
      User.countDocuments({ isActive: true }),
      Comment.countDocuments()
    ]);

    // Generate chart data for last 7 days (Submission Trends) map map map
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await Story.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      });
    }

    return formatResponse(res, 200, 'Dashboard analytics synchronized', {
      totalStories,
      pendingStories,
      activeUsers,
      totalComments,
      chartData: last7Days
    });
  } catch (error) {
    next(error);
  }
};

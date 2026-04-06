const Story = require('../models/Story');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Log = require('../models/Log');
const Settings = require('../models/Settings');
const ReadingProgress = require('../models/ReadingProgress');
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

const attachReadingStats = async (stories) => {
  if (!stories || stories.length === 0) return stories;
  const ids = stories.map((s) => s._id);
  const statsAgg = await ReadingProgress.aggregate([
    { $match: { storyId: { $in: ids } } },
    {
      $group: {
        _id: '$storyId',
        readers: { $sum: 1 },
        avgProgress: { $avg: '$progress' },
        completed: { $sum: { $cond: [{ $gte: ['$progress', 90] }, 1, 0] } }
      }
    }
  ]);

  const statsMap = new Map(
    statsAgg.map((s) => [
      String(s._id),
      {
        readers: s.readers || 0,
        avgProgress: Math.round(s.avgProgress || 0),
        completed: s.completed || 0
      }
    ])
  );

  return stories.map((s) => {
    const stat = statsMap.get(String(s._id)) || { readers: 0, avgProgress: 0, completed: 0 };
    return { ...s.toObject?.() ? s.toObject() : s, readingStats: stat };
  });
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

    const withStats = await attachReadingStats(stories);
    return formatResponse(res, 200, 'Stories loaded', withStats);
  } catch (error) {
    next(error);
  }
};

exports.getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'name email avatar')
      .lean();
    if (!story) return formatResponse(res, 404, 'Story not found');
    return formatResponse(res, 200, 'Story loaded', story);
  } catch (error) {
    next(error);
  }
};

exports.getPendingStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('author', 'name email');
    
    const withStats = await attachReadingStats(stories);
    return formatResponse(res, 200, 'Pending stories loaded', withStats);
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
exports.updateStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, status } = req.body;
    
    const story = await Story.findById(id);
    if (!story) return formatResponse(res, 404, 'Story not found');

    if (title) story.title = title;
    if (content) story.content = content;
    if (category) story.category = category;
    
    if (status) {
      story.status = status;
      if (status === 'approved') {
        story.isPublished = true;
        story.approvedAt = Date.now();
      } else if (status === 'rejected') {
        story.isPublished = false;
      }
    }

    await story.save();
    await createAuditLog(req.user._id, 'STORY_UPDATED', `Updated and synchronized narrative: ${story.title}`, story._id);

    return formatResponse(res, 200, 'Narrative synchronized successfully', story);
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
      .populate('userId', 'name email')
      .populate('storyId', 'title')
      .sort({ createdAt: -1 });
    return formatResponse(res, 200, 'Comments loaded', comments);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return formatResponse(res, 404, 'Comment not found');

    const wasApproved = comment.status === 'approved';
    await Comment.deleteOne({ _id: comment._id });
    if (wasApproved) {
      await Story.findByIdAndUpdate(comment.storyId, { $inc: { commentsCount: -1 } });
    }

    await createAuditLog(req.user._id, 'COMMENT_DELETED', `Deleted comment: ${comment._id}`, comment._id);

    return formatResponse(res, 200, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.approveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return formatResponse(res, 404, 'Comment not found');

    if (comment.status !== 'approved') {
      comment.status = 'approved';
      await comment.save();
      await Story.findByIdAndUpdate(comment.storyId, { $inc: { commentsCount: 1 } });
    }

    await createAuditLog(req.user._id, 'COMMENT_APPROVED', `Approved comment: ${comment._id}`, comment._id);

    return formatResponse(res, 200, 'Comment approved successfully', comment);
  } catch (error) {
    next(error);
  }
};

exports.rejectComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return formatResponse(res, 404, 'Comment not found');

    if (comment.status !== 'rejected') {
      if (comment.status === 'approved') {
        await Story.findByIdAndUpdate(comment.storyId, { $inc: { commentsCount: -1 } });
      }
      comment.status = 'rejected';
      await comment.save();
    }

    await createAuditLog(req.user._id, 'COMMENT_REJECTED', `Rejected comment: ${comment._id}`, comment._id);

    return formatResponse(res, 200, 'Comment rejected successfully', comment);
  } catch (error) {
    next(error);
  }
};

exports.bulkApproveComments = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
    const filter = ids && ids.length > 0 ? { _id: { $in: ids }, status: 'pending' } : { status: 'pending' };

    const pending = await Comment.find(filter).select('_id storyId').lean();
    if (!pending.length) {
      return formatResponse(res, 200, 'No pending comments to approve', { approved: 0 });
    }

    await Comment.updateMany({ _id: { $in: pending.map((c) => c._id) } }, { $set: { status: 'approved' } });

    // Increment commentsCount per story
    const counts = new Map();
    for (const c of pending) {
      const key = String(c.storyId);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const [storyId, count] of counts.entries()) {
      await Story.findByIdAndUpdate(storyId, { $inc: { commentsCount: count } });
    }

    await createAuditLog(req.user._id, 'COMMENT_APPROVED', `Bulk approved ${pending.length} comments`);

    return formatResponse(res, 200, 'Bulk approval complete', { approved: pending.length });
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
    const settings = await Settings.findOne().select('maintenanceMode featuredStoryId');
    return formatResponse(res, 200, 'Public archival status retrieved', {
      maintenanceMode: settings?.maintenanceMode || false,
      featuredStoryId: settings?.featuredStoryId || null
    });
  } catch (error) {
    next(error);
  }
};

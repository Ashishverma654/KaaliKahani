const Story = require('../models/Story');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Settings = require('../models/Settings');
const Like = require('../models/Like');
const ReadingProgress = require('../models/ReadingProgress');
const formatResponse = require('../utils/response');
const generateSlug = require('../utils/slugify');

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
 * Admin Story Creation
 */
exports.createStory = async (req, res, next) => {
  try {
    const { title, content, category, tags, coverImage, status, seriesId, seriesOrder, language = 'en' } = req.body;
    
    if (!title || !content) {
      return formatResponse(res, 400, 'Title and content are required');
    }

    // Generate unique slug
    let targetSlug = generateSlug(typeof title === 'object' ? (title.en || Object.values(title)[0]) : title);
    const exists = await Story.findOne({ [`slug.${language}`]: targetSlug });
    if (exists) {
      targetSlug = `${targetSlug}-${Math.random().toString(36).substr(2, 5)}`;
    }

    const story = await Story.create({
      title: typeof title === 'object' ? title : { [language]: title },
      content: typeof content === 'object' ? content : { [language]: content },
      originalContent: typeof content === 'object' ? content : { [language]: content },
      slug: { [language]: targetSlug },
      category: category || 'general-horror',
      tags: tags || [],
      coverImage,
      status: status || 'draft',
      author: req.user._id,
      language: [language],
      isPublished: status === 'published' || status === 'approved',
      seriesId: seriesId || null,
      seriesOrder: seriesOrder || 1
    });

    return formatResponse(res, 201, 'Story created successfully', story);
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
 * Update User Role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return formatResponse(res, 400, 'Invalid role assignment');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return formatResponse(res, 404, 'User not found');

    return formatResponse(res, 200, `User role updated to ${role}`, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update User (General)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { name, email, role }, 
      { new: true, runValidators: true }
    );
    
    if (!user) return formatResponse(res, 404, 'User not found');
    return formatResponse(res, 200, 'User profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return formatResponse(res, 404, 'User not found');
    
    // Cleanup stories/comments by this user
    await Story.deleteMany({ author: req.params.id });
    await Comment.deleteMany({ userId: req.params.id });

    return formatResponse(res, 200, 'User and associated data purged successfully');
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

    // Prevention: Cannot deactivate yourself
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
 * Comments Management
 */
exports.getAllComments = async (req, res, next) => {
  try {
    const { flagged } = req.query;
    const query = flagged === 'true' ? { isFlagged: true } : {};
    
    const comments = await Comment.find(query)
      .populate('userId', 'name email')
      .populate('storyId', 'title')
      .sort('-createdAt');

    return formatResponse(res, 200, 'Comments retrieved for moderation', comments);
  } catch (error) {
    next(error);
  }
};

exports.toggleCommentFlag = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return formatResponse(res, 404, 'Comment not found');

    comment.isFlagged = !comment.isFlagged;
    await comment.save();

    return formatResponse(res, 200, `Comment flag status: ${comment.isFlagged}`, comment);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return formatResponse(res, 404, 'Comment not found');

    return formatResponse(res, 200, 'Comment purged successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateCommentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return formatResponse(res, 400, 'Invalid status update request');
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!comment) return formatResponse(res, 404, 'Comment not found');

    return formatResponse(res, 200, `Comment status updated to ${status}`, comment);
  } catch (error) {
    next(error);
  }
};

exports.migrateComments = async (req, res, next) => {
  try {
    const result = await Comment.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'approved' } }
    );
    return formatResponse(res, 200, `Migrated ${result.modifiedCount} comments to approved status.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Advanced Analytics
 */
exports.getExtendedStats = async (req, res, next) => {
  try {
    const { range = '30' } = req.query;
    const days = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateQuery = { createdAt: { $gte: startDate } };
    const progressQuery = { updatedAt: { $gte: startDate } };

    const [totalViews, totalLikes, totalComments] = await Promise.all([
      ReadingProgress.countDocuments(progressQuery),
      Like.countDocuments(dateQuery),
      Comment.countDocuments(dateQuery)
    ]);

    return formatResponse(res, 200, 'Extended stats calculated', {
      totalViews,
      totalLikes,
      totalComments
    });
  } catch (error) {
    next(error);
  }
};

exports.getTopContent = async (req, res, next) => {
  try {
    const { range = '30' } = req.query;
    const days = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateQuery = { createdAt: { $gte: startDate } };

    const [topByViews, topByLikes, topByComments] = await Promise.all([
      Story.find(dateQuery).sort('-views').limit(10).select('title views'),
      Story.find(dateQuery).sort('-likesCount').limit(10).select('title likesCount'),
      Story.find(dateQuery).sort('-commentsCount').limit(10).select('title commentsCount')
    ]);

    return formatResponse(res, 200, 'Top content rankings fetched', {
      topByViews,
      topByLikes,
      topByComments
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { range = '14' } = req.query;
    const days = parseInt(range);
    const promises = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      promises.push(
        Promise.all([
          ReadingProgress.countDocuments({ updatedAt: { $gte: start, $lte: end } }),
          ReadingProgress.distinct('userId', { updatedAt: { $gte: start, $lte: end } }),
          Like.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Comment.countDocuments({ createdAt: { $gte: start, $lte: end } })
        ]).then(([views, uniqueVisitors, likes, comments]) => {
          return { start, views, uniqueVisitors: uniqueVisitors.length, likes, comments };
        })
      );
    }

    const results = await Promise.all(promises);

    const traffic = results.map(r => ({
      date: r.start.toISOString(),
      views: r.views,
      uniqueVisitors: r.uniqueVisitors
    }));

    const engagement = results.map(r => ({
      date: r.start.toISOString(),
      likes: r.likes,
      comments: r.comments
    }));

    return formatResponse(res, 200, 'Time-series analytics generated', { traffic, engagement });
  } catch (error) {
    next(error);
  }
};

exports.getDeviceStats = async (req, res, next) => {
  try {
    const totalViews = await Story.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]);
    const base = totalViews[0]?.total || 100;
    
    return formatResponse(res, 200, 'Device metrics retrieved', {
      Mobile: Math.floor(base * 0.65),
      Desktop: Math.floor(base * 0.25),
      Tablet: Math.floor(base * 0.10)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Site Settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    return formatResponse(res, 200, 'Global settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { returnDocument: 'after', upsert: true });
    return formatResponse(res, 200, 'Global settings updated successfully', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Global Search
 */
exports.globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return formatResponse(res, 400, 'Search query missing');

    const [stories, users] = await Promise.all([
      Story.find({ $or: [{ 'title.en': new RegExp(q, 'i') }, { 'title.hi': new RegExp(q, 'i') }] }).limit(5).select('title author'),
      User.find({ $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] }).limit(5).select('name email')
    ]);

    return formatResponse(res, 200, 'Global search results', { stories, users });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Dashboard Statistics
 */
exports.getStats = async (req, res, next) => {
  try {
    const { range = '30' } = req.query;
    const days = parseInt(range);

    const [totalStories, pendingStories, totalUsers, activeUsers, totalComments] = await Promise.all([
      Story.countDocuments(),
      Story.countDocuments({ status: 'pending' }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Comment.countDocuments()
    ]);

    // Generate chart data based on range
    const promises = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      promises.push(
        ReadingProgress.countDocuments({
          updatedAt: { $gte: startOfDay, $lte: endOfDay }
        }).then(count => {
          return {
            date: startOfDay.toISOString(),
            name: days > 7 
              ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short' }),
            count
          };
        })
      );
    }

    const chartData = await Promise.all(promises);

    return formatResponse(res, 200, 'Dashboard analytics synchronized', {
      totalStories,
      pendingStories,
      totalUsers,
      activeUsers,
      totalComments,
      chartData
    });
  } catch (error) {
    next(error);
  }
};

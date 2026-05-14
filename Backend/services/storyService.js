const Story = require('../models/Story');
const Series = require('../models/Series');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const generateSlug = require('../utils/slugify');
const calculateReadTime = require('../utils/readTime');
const geminiService = require('./geminiService');

exports.submitStory = async (authorId, payload, storyId = null) => {
  // Extract pure language (Defaulting to 'en')
  let lang = payload.language || 'en';
  if (Array.isArray(lang)) lang = lang[0] || 'en';
  if (typeof lang !== 'string') lang = 'en';
  const titleText = payload.title;
  const contentText = payload.content;

  if (!titleText || !contentText) {
    throw new Error('Title and content are required');
  }

  // Ensure slug uniqueness gracefully via hashing randomly if exists
  let targetSlug = generateSlug(titleText);
  const exists = await Story.findOne({ [`slug.${lang}`]: targetSlug });
  if (exists) {
    targetSlug = `${targetSlug}-${Math.random().toString(36).substr(2, 5)}`;
  }

  // Build the nested linguistic objects
  const titleObj = { [lang]: titleText };
  const contentObj = { [lang]: contentText };
  const slugObj = { [lang]: targetSlug };

  const readTime = calculateReadTime(contentObj);

  // SERIES CATEGORY ENFORCEMENT: If story belongs to a series, lock category to series category
  let resolvedCategory = payload.category || 'general-horror';
  if (payload.seriesId) {
    const series = await Series.findById(payload.seriesId).select('category').lean();
    if (series && series.category) {
      resolvedCategory = series.category;
    }
  }

  let story;
  if (storyId) {
    // Transition existing draft to submission
    story = await Story.findOneAndUpdate(
      { _id: storyId, author: authorId },
      {
        title: titleObj,
        content: contentObj,
        slug: slugObj,
        language: [lang],
        languages: [lang],
        images: payload.images || [],
        coverImage: payload.coverImage || (payload.images?.length > 0 ? payload.images[0] : null),
        seriesId: payload.seriesId || null,
        seriesOrder: payload.seriesOrder || 1,
        category: resolvedCategory,
        readTime,
        status: 'pending',
        isPublished: false
      },
      { new: true }
    );
    if (!story) throw new Error('Story/Draft not found or unauthorized');
  } else {
    // Create new submission from scratch
    story = await Story.create({
      title: titleObj,
      content: contentObj,
      originalContent: contentObj, // immutable backup log as requested
      slug: slugObj,
      language: [lang],
      languages: [lang],
      images: payload.images || [],
      coverImage: payload.coverImage || (payload.images?.length > 0 ? payload.images[0] : null),
      seriesId: payload.seriesId || null,
      seriesOrder: payload.seriesOrder || 1,
      category: resolvedCategory,
      author: authorId,
      readTime,
      status: 'pending',
      isPublished: false
    });
  }

  // Intelligence Pipeline Execution (Non-blocking)
  const aiAnalysis = async () => {
    try {
      const aiResults = await geminiService.analyzeStory(contentText, lang);
      if (aiResults) {
        // Update story with AI Suggestions and Translated Original
        const updateData = {
          [`content.${lang === 'en' ? 'hi' : 'en'}`]: aiResults.originalTranslated?.[lang === 'en' ? 'hi' : 'en'],
          aiSuggestions: {
            title: aiResults.suggestedTitle,
            content: aiResults.enhancedContent,
            realismScore: aiResults.realismScore
          }
        };

        if (!story.category || story.category === 'general-horror') {
          updateData.category = aiResults.suggestedCategory;
        }

        await Story.findByIdAndUpdate(story._id, updateData);
        console.log(`Gemini Intelligence Finalized for Story: ${story._id}`);
      }
    } catch (error) {
      console.warn(`Gemini Pipeline Fail for ${story._id}: ${error.message}`);
    }
  };

  // Trigger the pipeline but do not block the user response
  aiAnalysis();

  return story;
};

exports.getPublicStories = async (queryLanguage = 'en', page = 1, limit = 10, category = null) => {
  const skip = (page - 1) * limit;

  // Enforce Status rules explicitly and target specific language matching
  // Support both 'language' and 'languages' field names for cross-DB compatibility
  const filter = { 
    status: 'approved',
    isPublished: true,
    $or: [
      { language: { $in: [queryLanguage] } },
      { languages: { $in: [queryLanguage] } }
    ]
  };

  if (category) {
    filter.category = category;
  }

  const stories = await Story.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar') // Abstracting sensitive props
    .lean(); // Speed optimization

  const total = await Story.countDocuments(filter);

  return { stories, total, page, pages: Math.ceil(total / limit) };
};

exports.getStoryBySlug = async (slug, language = 'en', userId = null) => {
  // Query by nested language-specific slug mapping
  let query = { [`slug.${language}`]: slug, status: 'approved', isPublished: true };

  if (userId) {
     const storyCheck = await Story.findOne({ [`slug.${language}`]: slug }).select('author status isPublished');
     if (storyCheck && (storyCheck.author.toString() === userId.toString() || storyCheck.status === 'approved')) {
        query = { [`slug.${language}`]: slug };
     }
  }

  let updateData = { $inc: { views: 1 } };
  if (userId) {
     const alreadyViewed = await Story.findOne({ ...query, viewers: userId }).select('_id');
     if (!alreadyViewed) {
        updateData = { 
           $inc: { views: 1 },
           $addToSet: { viewers: userId }
        };
     } else {
        updateData = {}; // No increment if already viewed
     }
  }

  const story = await Story.findOneAndUpdate(
    query, 
    updateData,
    { returnDocument: 'after' }
  ).populate('author', 'name avatar').populate('seriesId', 'title description').lean();

  if (!story) {
    throw new Error('Story not found or not published');
  }

  // Pull associated comments
  const comments = await Comment.find({ storyId: story._id, status: 'approved' })
    .sort({ createdAt: -1 })
    .populate('userId', 'name avatar')
    .lean();

  // Aggregate reading progress stats
  const ReadingProgress = require('../models/ReadingProgress');
  const progressAgg = await ReadingProgress.aggregate([
    { $match: { storyId: story._id } },
    {
      $group: {
        _id: null,
        readers: { $sum: 1 },
        avgProgress: { $avg: '$progress' },
        completed: { $sum: { $cond: [{ $gte: ['$progress', 90] }, 1, 0] } }
      }
    }
  ]);

  const progressStats = progressAgg?.[0]
    ? {
        readers: progressAgg[0].readers || 0,
        avgProgress: Math.round(progressAgg[0].avgProgress || 0),
        completed: progressAgg[0].completed || 0
      }
    : { readers: 0, avgProgress: 0, completed: 0 };

  return { story, comments, progressStats };
};

exports.getFeaturedStory = async () => {
  const Settings = require('../models/Settings');
  const settings = await Settings.findOne().select('featuredStoryId').lean();
  if (!settings?.featuredStoryId) return null;

  const story = await Story.findOne({
    _id: settings.featuredStoryId,
    status: 'approved',
    isPublished: true
  })
    .populate('author', 'name avatar')
    .lean();

  return story;
};

exports.searchStories = async (query, language = 'en') => {
  if (!query) return [];
  
  const searchRegex = new RegExp(query, 'i'); // Case-insensitive fuzzy search
  
  // Use $and to combine language check ($or) with text search ($or)
  const filter = {
    status: 'approved',
    isPublished: true,
    $and: [
      { $or: [
        { language: { $in: [language] } },
        { languages: { $in: [language] } }
      ]},
      { $or: [
        { [`title.${language}`]: searchRegex },
        { [`content.${language}`]: searchRegex }
      ]}
    ]
  };

  const stories = await Story.find(filter)
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return stories;
};

exports.saveDraft = async (authorId, payload) => {
  let lang = payload.language || 'en';
  if (Array.isArray(lang)) lang = lang[0] || 'en';
  if (typeof lang !== 'string') lang = 'en';

  const titleText = payload.title || '';
  const contentText = payload.content || '';

  const titleObj = { [lang]: titleText };
  const contentObj = { [lang]: contentText };

  // SERIES CATEGORY ENFORCEMENT
  let resolvedCategory = payload.category || 'general-horror';
  if (payload.seriesId) {
    const series = await Series.findById(payload.seriesId).select('category').lean();
    if (series && series.category) {
      resolvedCategory = series.category;
    }
  }

  const draft = await Story.create({
    title: titleObj,
    content: contentObj,
    originalContent: contentObj,
    language: [lang],
    languages: [lang],
    images: payload.images || [],
    coverImage: payload.coverImage || (payload.images?.length > 0 ? payload.images[0] : null),
    seriesId: payload.seriesId || null,
    seriesOrder: payload.seriesOrder || 1,
    category: resolvedCategory,
    author: authorId,
    readTime: calculateReadTime(contentObj),
    status: 'draft',
    isPublished: false
  });

  return draft;
};

exports.updateDraft = async (authorId, draftId, payload) => {
  const draft = await Story.findOne({ _id: draftId, author: authorId, status: 'draft' });
  if (!draft) throw new Error('Draft not found');

  const lang = payload.language || 'en';
  if (payload.title !== undefined) draft.title = { ...draft.title, [lang]: payload.title };
  if (payload.content !== undefined) draft.content = { ...draft.content, [lang]: payload.content };
  if (payload.images) draft.images = payload.images;
  if (payload.coverImage) draft.coverImage = payload.coverImage;
  else if (payload.images?.length > 0) draft.coverImage = payload.images[0];
  if (payload.category) draft.category = payload.category;
  if (payload.seriesId !== undefined) {
    draft.seriesId = payload.seriesId || null;
  }
  
  // SERIES CATEGORY ENFORCEMENT
  if (draft.seriesId) {
    const series = await Series.findById(draft.seriesId).select('category').lean();
    if (series && series.category) {
      draft.category = series.category;
    }
  }

  if (payload.seriesOrder !== undefined) draft.seriesOrder = payload.seriesOrder || 1;
  draft.readTime = calculateReadTime(draft.content);

  await draft.save();
  return draft;
};

exports.getMyDrafts = async (authorId) => {
  return Story.find({ author: authorId, status: 'draft' })
    .sort({ updatedAt: -1 })
    .lean();
};

exports.getDraftById = async (authorId, draftId) => {
  const draft = await Story.findOne({ _id: draftId, author: authorId, status: 'draft' }).lean();
  return draft;
};

exports.deleteStory = async (userId, storyId, isAdmin = false) => {
  const filter = { _id: storyId };
  if (!isAdmin) {
    filter.author = userId;
    // Optional: Only allow users to delete drafts or pending stories? 
    // For now, let's allow them to delete their own stories.
  }

  const story = await Story.findOneAndDelete(filter);
  if (!story) throw new Error('Story not found or unauthorized');

  // Cleanup associated records if necessary (Like, Comment, etc.)
  await Promise.all([
    Like.deleteMany({ storyId }),
    Comment.deleteMany({ storyId }),
    Bookmark.deleteMany({ storyId })
  ]);

  return story;
};

exports.toggleLike = async (userId, storyId) => {
  // Ensure story exists
  const story = await Story.findById(storyId);
  if (!story) throw new Error('Story not found');

  const existingLike = await Like.findOne({ userId, storyId });
  
  if (existingLike) {
    // Unlike logic
    await Like.deleteOne({ _id: existingLike._id });
    await Story.findByIdAndUpdate(storyId, { $inc: { likesCount: -1 } });
    return { message: 'Story unliked successfully', action: 'unliked' };
  } else {
    // Like logic
    await Like.create({ userId, storyId });
    await Story.findByIdAndUpdate(storyId, { $inc: { likesCount: 1 } });
    return { message: 'Story liked successfully', action: 'liked' };
  }
};

exports.addComment = async (userId, storyId, content) => {
  if (!content) throw new Error('Comment content is required');

  const story = await Story.findById(storyId);
  if (!story) throw new Error('Story not found');

  const comment = await Comment.create({
    storyId,
    userId,
    content,
    status: 'pending'
  });

  return comment;
};

exports.getMyStories = async (userId) => {
  const stories = await Story.find({ author: userId, status: { $ne: 'draft' } })
    .sort({ createdAt: -1 })
    .lean();
    
  return stories;
};

exports.toggleBookmark = async (userId, storyId) => {
  const story = await Story.findById(storyId);
  if (!story) throw new Error('Story not found');

  const existingBookmark = await Bookmark.findOne({ userId, storyId });
  
  if (existingBookmark) {
    await Bookmark.deleteOne({ _id: existingBookmark._id });
    return { message: 'Story removed from bookmarks', action: 'removed' };
  } else {
    await Bookmark.create({ userId, storyId });
    return { message: 'Story saved to bookmarks', action: 'saved' };
  }
};

exports.getMyBookmarks = async (userId) => {
  const bookmarks = await Bookmark.find({ userId }).populate({
    path: 'storyId',
    populate: { path: 'author', select: 'name avatar' }
  }).lean();
  
  return bookmarks.map(b => b.storyId).filter(s => s !== null);
};

exports.isStoryBookmarked = async (userId, storyId) => {
  const exists = await Bookmark.exists({ userId, storyId });
  return !!exists;
};

exports.isStoryLiked = async (userId, storyId) => {
  const exists = await Like.exists({ userId, storyId });
  return !!exists;
};

exports.getMyLikedStories = async (userId) => {
  const likes = await Like.find({ userId }).populate({
    path: 'storyId',
    populate: { path: 'author', select: 'name avatar' }
  }).lean();
  
  return likes.map(l => l.storyId).filter(s => s !== null);
};

exports.deleteStory = async (userId, storyId, isAdmin = false) => {
  const story = await Story.findById(storyId);
  if (!story) throw new Error('Story not found');

  // Authorization check: Only author or admin can delete
  if (story.author.toString() !== userId.toString() && !isAdmin) {
    throw new Error('Not authorized to delete this story');
  }

  await Story.findByIdAndDelete(storyId);
  
  // Cleanup related data (likes, bookmarks, comments)
  await Promise.all([
    Like.deleteMany({ storyId }),
    Bookmark.deleteMany({ storyId }),
    Comment.deleteMany({ storyId })
  ]);

  return true;
};

const Story = require('../models/Story');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const generateSlug = require('../utils/slugify');
const calculateReadTime = require('../utils/readTime');
const geminiService = require('./geminiService');

exports.submitStory = async (authorId, payload) => {
  // Extract pure language (Defaulting map)
  const lang = payload.language || 'en';
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

  const newStory = await Story.create({
    title: titleObj,
    content: contentObj,
    originalContent: contentObj, // immutable backup log as requested
    slug: slugObj,
    language: [lang],
    images: payload.images || [],
    seriesId: payload.seriesId || null,
    seriesOrder: payload.seriesOrder || 1,
    category: payload.category || 'general-horror',
    author: authorId,
    readTime,
    isPublished: false
  });

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

        // Also suggest a category if the user hasn't specified one yet
        if (!newStory.category || newStory.category === 'general-horror') {
          updateData.category = aiResults.suggestedCategory;
        }

        await Story.findByIdAndUpdate(newStory._id, updateData);
        console.log(`Gemini Intelligence Finalized for Story: ${newStory._id}`);
      }
    } catch (error) {
      console.warn(`Gemini Pipeline Fail for ${newStory._id}: ${error.message}`);
    }
  };

  // Trigger the pipeline but do not block the user response
  aiAnalysis();

  return newStory;
};

exports.getPublicStories = async (queryLanguage = 'en', page = 1, limit = 10, category = null) => {
  const skip = (page - 1) * limit;

  // Enforce Status rules explicitly and target specific language matching
  const filter = { 
    status: 'approved',
    isPublished: true,
    language: { $in: [queryLanguage] }
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

exports.getStoryBySlug = async (slug, language = 'en') => {
  // Query by nested language-specific slug mapping
  const query = { [`slug.${language}`]: slug, status: 'approved', isPublished: true };
  
  const story = await Story.findOneAndUpdate(
    query, 
    { $inc: { views: 1 } }, // Increment view explicitly atomically
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
  const filter = {
    status: 'approved',
    isPublished: true,
    language: { $in: [language] },
    $text: { $search: query }
  };

  const stories = await Story.find(filter, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .lean();

  return stories;
};

exports.saveDraft = async (authorId, payload) => {
  const lang = payload.language || 'en';
  const titleText = payload.title || '';
  const contentText = payload.content || '';

  const titleObj = { [lang]: titleText };
  const contentObj = { [lang]: contentText };

  const draft = await Story.create({
    title: titleObj,
    content: contentObj,
    originalContent: contentObj,
    language: [lang],
    images: payload.images || [],
    seriesId: payload.seriesId || null,
    seriesOrder: payload.seriesOrder || 1,
    category: payload.category || 'general-horror',
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
  if (payload.category) draft.category = payload.category;
  if (payload.seriesId !== undefined) draft.seriesId = payload.seriesId || null;
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

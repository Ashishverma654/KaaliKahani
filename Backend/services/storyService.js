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
    { new: true }
  ).populate('author', 'name avatar').lean();

  if (!story) {
    throw new Error('Story not found or not published');
  }

  // Pull associated comments
  const comments = await Comment.find({ storyId: story._id })
    .sort({ createdAt: -1 })
    .populate('userId', 'name avatar')
    .lean();

  return { story, comments };
};

exports.toggleLike = async (userId, storyId) => {
  // Ensure story exists
  const story = await Story.findById(storyId);
  if (!story) throw new Error('Story not found');

  // Strict constraint check
  const existingLike = await Like.findOne({ userId, storyId });
  if (existingLike) {
    throw new Error('You have already liked this story');
  }

  // Bind Like schema connection
  await Like.create({ userId, storyId });

  // Atomic aggregate bump
  await Story.findByIdAndUpdate(storyId, { $inc: { likesCount: 1 } });
  
  return { message: 'Story liked successfully' };
};

exports.addComment = async (userId, storyId, content) => {
  if (!content) throw new Error('Comment content is required');

  const story = await Story.findById(storyId);
  if (!story) throw new Error('Story not found');

  const comment = await Comment.create({
    storyId,
    userId,
    content
  });

  // Atomic aggregate bump
  await Story.findByIdAndUpdate(storyId, { $inc: { commentsCount: 1 } });

  return comment;
};

exports.getMyStories = async (userId) => {
  const stories = await Story.find({ author: userId })
    .sort({ createdAt: -1 })
    .lean();
    
  return stories;
};

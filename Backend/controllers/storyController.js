const storyService = require('../services/storyService');
const geminiService = require('../services/geminiService');
const formatResponse = require('../utils/response');

exports.submitStory = async (req, res, next) => {
  try {
    const story = await storyService.submitStory(req.user._id, req.body);
    return formatResponse(res, 201, 'Story submitted for review successfully', story);
  } catch (error) {
    next(error);
  }
};

exports.getStories = async (req, res, next) => {
  try {
    const lang = req.query.lang || 'en';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category || null;
    
    const data = await storyService.getPublicStories(lang, page, limit, category);
    return formatResponse(res, 200, 'Stories fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedStory = async (req, res, next) => {
  try {
    const story = await storyService.getFeaturedStory();
    return formatResponse(res, 200, 'Featured story loaded', story);
  } catch (error) {
    next(error);
  }
};

exports.searchStories = async (req, res, next) => {
  try {
    const query = req.query.query || '';
    const lang = req.query.lang || 'en';
    const stories = await storyService.searchStories(query, lang);
    return formatResponse(res, 200, 'Search complete', stories);
  } catch (error) {
    next(error);
  }
};

exports.getStoryBySlug = async (req, res, next) => {
  try {
    const lang = req.query.lang || 'en';
    const data = await storyService.getStoryBySlug(req.params.slug, lang);
    return formatResponse(res, 200, 'Story loaded successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.addLike = async (req, res, next) => {
  try {
    const result = await storyService.toggleLike(req.user._id, req.params.id);
    return formatResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const comment = await storyService.addComment(req.user._id, req.params.id, req.body.content);
    return formatResponse(res, 201, 'Comment published', comment);
  } catch (error) {
    next(error);
  }
};

exports.getMyStories = async (req, res, next) => {
  try {
    const data = await storyService.getMyStories(req.user._id);
    return formatResponse(res, 200, 'Your stories fetched securely', data);
  } catch (error) {
    next(error);
  }
};

exports.getMyDrafts = async (req, res, next) => {
  try {
    const data = await storyService.getMyDrafts(req.user._id);
    return formatResponse(res, 200, 'Drafts fetched', data);
  } catch (error) {
    console.error('Get Drafts Error:', error.message);
    return formatResponse(res, 200, 'Drafts fetched', []);
  }
};

exports.getDraftById = async (req, res, next) => {
  try {
    const draft = await storyService.getDraftById(req.user._id, req.params.id);
    if (!draft) return formatResponse(res, 404, 'Draft not found');
    return formatResponse(res, 200, 'Draft loaded', draft);
  } catch (error) {
    next(error);
  }
};

exports.saveDraft = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || title.trim().length < 3) {
      return formatResponse(res, 400, 'Draft requires a title (minimum 3 characters)');
    }
    if (!content || content.trim().length < 10) {
      return formatResponse(res, 400, 'Draft requires some content (minimum 10 characters)');
    }

    const draft = await storyService.saveDraft(req.user._id, req.body);
    return formatResponse(res, 201, 'Draft saved', draft);
  } catch (error) {
    next(error);
  }
};

exports.updateDraft = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (title !== undefined && title.trim().length < 3) {
      return formatResponse(res, 400, 'Draft title must be at least 3 characters');
    }
    if (content !== undefined && content.trim().length < 10) {
      return formatResponse(res, 400, 'Draft content must be at least 10 characters');
    }

    const draft = await storyService.updateDraft(req.user._id, req.params.id, req.body);
    return formatResponse(res, 200, 'Draft updated', draft);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Image Uplink to Cloudinary
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return formatResponse(res, 400, 'No file provided');
    }
    return formatResponse(res, 200, 'Image uploaded successfully', {
      imageUrl: req.file.path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Perform Real-time AI Sense Analysis
 */
exports.analyzeStory = async (req, res, next) => {
  try {
    const { content, lang } = req.body;
    if (!content) {
      return formatResponse(res, 400, 'Narrative content required for analysis');
    }

    const aiResults = await geminiService.analyzeStory(content, lang || 'en');
    if (!aiResults) {
      return formatResponse(res, 503, 'AI analysis is disabled or unavailable');
    }

    return formatResponse(res, 200, 'AI Analysis Complete', aiResults);
  } catch (error) {
    next(error);
  }
};

exports.refineStory = async (req, res, next) => {
  try {
    const { content, prompt, lang } = req.body;
    
    if (!content || !prompt) {
      return formatResponse(res, 400, 'Narrative content and instruction prompt are required');
    }

    const refinedContent = await geminiService.refineStory(content, prompt, lang || 'en');
    
    if (!refinedContent) {
      return formatResponse(res, 503, 'AI service is currently unavailable');
    }

    return formatResponse(res, 200, 'Story refined successfully', { refinedContent });
  } catch (error) {
    next(error);
  }
};
exports.addBookmark = async (req, res, next) => {
  try {
    const result = await storyService.toggleBookmark(req.user._id, req.params.id);
    return formatResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

exports.getMyBookmarks = async (req, res, next) => {
  try {
    const stories = await storyService.getMyBookmarks(req.user._id);
    return formatResponse(res, 200, 'Bookmarks fetched', stories);
  } catch (error) {
    next(error);
  }
};

exports.checkBookmark = async (req, res, next) => {
  try {
    const isBookmarked = await storyService.isStoryBookmarked(req.user._id, req.params.id);
    return formatResponse(res, 200, 'Status fetched', { isBookmarked });
  } catch (error) {
    next(error);
  }
};

exports.checkLike = async (req, res, next) => {
  try {
    const isLiked = await storyService.isStoryLiked(req.user._id, req.params.id);
    return formatResponse(res, 200, 'Like status fetched', { isLiked });
  } catch (error) {
    next(error);
  }
};

exports.getMyLikedStories = async (req, res, next) => {
  try {
    const stories = await storyService.getMyLikedStories(req.user._id);
    return formatResponse(res, 200, 'Liked stories fetched', stories);
  } catch (error) {
    next(error);
  }
};

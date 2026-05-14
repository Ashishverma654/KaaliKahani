const Series = require('../models/Series');
const Story = require('../models/Story');
const formatResponse = require('../utils/response');

/**
 * Create a new series (authenticated user)
 */
exports.createSeries = async (req, res, next) => {
  try {
    const { title, description, category, coverImage } = req.body;
    if (!title) return formatResponse(res, 400, 'Series title is required');
    if (!category) return formatResponse(res, 400, 'Series category is required');

    const series = await Series.create({
      title,
      description: description || '',
      category,
      coverImage: coverImage || '',
      author: req.user._id
    });

    return formatResponse(res, 201, 'Series created', series);
  } catch (error) {
    next(error);
  }
};

/**
 * Get series belonging to the authenticated user
 */
exports.getMySeries = async (req, res, next) => {
  try {
    const series = await Series.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    return formatResponse(res, 200, 'Series loaded', series);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single series by ID with its stories
 */
exports.getSeriesById = async (req, res, next) => {
  try {
    const series = await Series.findById(req.params.id)
      .populate('author', 'name avatar')
      .lean();
    if (!series) return formatResponse(res, 404, 'Series not found');

    const stories = await Story.find({ seriesId: series._id, status: 'approved', isPublished: true })
      .sort({ seriesOrder: 1, createdAt: 1 })
      .populate('author', 'name avatar')
      .lean();

    return formatResponse(res, 200, 'Series loaded', { series, stories });
  } catch (error) {
    next(error);
  }
};

/**
 * [ADMIN] Get all series across all users
 */
exports.getAllSeries = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const seriesList = await Series.find(filter)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Attach story count for each series
    const seriesWithCounts = await Promise.all(
      seriesList.map(async (s) => {
        const storyCount = await Story.countDocuments({ seriesId: s._id });
        return { ...s, storyCount };
      })
    );

    return formatResponse(res, 200, 'All series fetched', seriesWithCounts);
  } catch (error) {
    next(error);
  }
};

/**
 * [ADMIN] Update a series
 */
exports.updateSeries = async (req, res, next) => {
  try {
    const { title, description, category, coverImage } = req.body;
    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (coverImage !== undefined) updateFields.coverImage = coverImage;
    if (category !== undefined) {
      updateFields.category = category;
      // When series category changes, update ALL stories in this series
      await Story.updateMany(
        { seriesId: req.params.id },
        { $set: { category } }
      );
    }

    const series = await Series.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!series) return formatResponse(res, 404, 'Series not found');

    return formatResponse(res, 200, 'Series updated', series);
  } catch (error) {
    next(error);
  }
};

/**
 * [ADMIN] Delete a series (unlinks stories, does not delete them)
 */
exports.deleteSeries = async (req, res, next) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) return formatResponse(res, 404, 'Series not found');

    // Unlink all stories from this series
    await Story.updateMany(
      { seriesId: req.params.id },
      { $set: { seriesId: null, seriesOrder: 1 } }
    );

    return formatResponse(res, 200, 'Series deleted and stories unlinked');
  } catch (error) {
    next(error);
  }
};

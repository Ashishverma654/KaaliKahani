const Series = require('../models/Series');
const Story = require('../models/Story');
const formatResponse = require('../utils/response');

exports.createSeries = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) return formatResponse(res, 400, 'Series title is required');

    const series = await Series.create({
      title,
      description: description || '',
      author: req.user._id
    });

    return formatResponse(res, 201, 'Series created', series);
  } catch (error) {
    next(error);
  }
};

exports.getMySeries = async (req, res, next) => {
  try {
    const series = await Series.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    return formatResponse(res, 200, 'Series loaded', series);
  } catch (error) {
    next(error);
  }
};

exports.getSeriesById = async (req, res, next) => {
  try {
    const series = await Series.findById(req.params.id).lean();
    if (!series) return formatResponse(res, 404, 'Series not found');

    const stories = await Story.find({ seriesId: series._id, status: 'approved', isPublished: true })
      .sort({ createdAt: 1 })
      .lean();

    return formatResponse(res, 200, 'Series loaded', { series, stories });
  } catch (error) {
    next(error);
  }
};

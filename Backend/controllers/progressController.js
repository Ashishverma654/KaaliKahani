const ReadingProgress = require('../models/ReadingProgress');
const formatResponse = require('../utils/response');

exports.getProgress = async (req, res, next) => {
  try {
    const progress = await ReadingProgress.findOne({
      userId: req.user._id,
      storyId: req.params.id
    }).lean();

    return formatResponse(res, 200, 'Progress loaded', progress || { progress: 0 });
  } catch (error) {
    next(error);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;
    const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));

    const updated = await ReadingProgress.findOneAndUpdate(
      { userId: req.user._id, storyId: req.params.id },
      { progress: safeProgress, lastUpdatedAt: new Date() },
      { returnDocument: 'after', upsert: true }
    );

    return formatResponse(res, 200, 'Progress updated', updated);
  } catch (error) {
    next(error);
  }
};

const Story = require('../models/Story');

class FeedController {
  // GET /api/feed - Get paginated stories
  async getFeed(req, res, next) {
    try {
      const { page = 1, limit = 20, sort = 'recent' } = req.query;
      const skip = (page - 1) * limit;

      // Build sort criteria
      let sortCriteria = {};
      switch (sort) {
        case 'popular':
          sortCriteria = { 'metadata.likes': -1, createdAt: -1 };
          break;
        case 'viewed':
          sortCriteria = { 'metadata.views': -1, createdAt: -1 };
          break;
        case 'oldest':
          sortCriteria = { createdAt: 1 };
          break;
        case 'recent':
        default:
          sortCriteria = { createdAt: -1 };
      }

      // Get only completed stories
      const stories = await Story.find({ status: 'complete' })
        .sort(sortCriteria)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('visualStyleId', 'name slug')
        .populate('audioStyleId', 'name slug')
        .select('-__v -errorMessage')
        .lean();

      // Get total count for pagination
      const total = await Story.countDocuments({ status: 'complete' });

      res.json({
        success: true,
        stories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /api/feed/:id - Get specific story
  async getStoryById(req, res, next) {
    try {
      const { id } = req.params;

      const story = await Story.findById(id)
        .populate('visualStyleId')
        .populate('audioStyleId')
        .populate('promptTemplateId')
        .lean();

      if (!story) {
        return res.status(404).json({
          success: false,
          error: 'Story not found'
        });
      }

      res.json({
        success: true,
        story
      });

    } catch (error) {
      next(error);
    }
  }

  // POST /api/feed/:id/view - Increment view count
  async incrementViews(req, res, next) {
    try {
      const { id } = req.params;

      const story = await Story.findByIdAndUpdate(
        id,
        { $inc: { 'metadata.views': 1 } },
        { new: true }
      ).select('metadata.views');

      if (!story) {
        return res.status(404).json({
          success: false,
          error: 'Story not found'
        });
      }

      res.json({
        success: true,
        views: story.metadata.views
      });

    } catch (error) {
      next(error);
    }
  }

  // POST /api/feed/:id/like - Increment like count
  async incrementLikes(req, res, next) {
    try {
      const { id } = req.params;

      const story = await Story.findByIdAndUpdate(
        id,
        { $inc: { 'metadata.likes': 1 } },
        { new: true }
      ).select('metadata.likes');

      if (!story) {
        return res.status(404).json({
          success: false,
          error: 'Story not found'
        });
      }

      res.json({
        success: true,
        likes: story.metadata.likes
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeedController();

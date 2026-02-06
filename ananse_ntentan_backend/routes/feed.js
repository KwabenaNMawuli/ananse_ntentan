const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

// Feed endpoints
router.get('/', feedController.getFeed.bind(feedController));
router.get('/:id', feedController.getStoryById.bind(feedController));
router.post('/:id/view', feedController.incrementViews.bind(feedController));
router.post('/:id/like', feedController.incrementLikes.bind(feedController));

module.exports = router;

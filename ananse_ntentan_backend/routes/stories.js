const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const upload = require('../middleware/upload');

// Story submission endpoints
router.post('/write', storyController.createWriteStory.bind(storyController));
// Use upload.any() to debug/allow flexible field names, handled in controller
router.post('/speak', upload.any(), storyController.createSpeakStory.bind(storyController));
router.post('/sketch', upload.any(), storyController.createSketchStory.bind(storyController));



router.post('/sketch', (req, res) => {
  res.status(501).json({ message: 'SKETCH endpoint - coming soon' });
});

// Story status and retrieval
router.get('/:id/status', storyController.getStoryStatus.bind(storyController));
router.get('/:id', storyController.getStory.bind(storyController));

module.exports = router;

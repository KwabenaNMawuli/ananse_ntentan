const express = require('express');
const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/visual', (req, res) => {
  res.status(501).json({ message: 'Visual styles endpoint - coming soon' });
});

router.get('/audio', (req, res) => {
  res.status(501).json({ message: 'Audio styles endpoint - coming soon' });
});

module.exports = router;

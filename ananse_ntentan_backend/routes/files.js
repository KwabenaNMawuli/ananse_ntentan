const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const fileService = require('../services/fileService');

// GET /api/files/audio/:id - Stream audio file
router.get('/audio/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid file id' });
    }
    
    const stream = await fileService.getFileStream(id);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes'
    });
    
    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(404).json({ success: false, error: 'Audio file not found' });
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/files/image/:id - Stream image file
router.get('/image/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid file id' });
    }
    
    // Get file metadata to determine correct content type
    const bucket = fileService.initialize();
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, error: 'Image file not found' });
    }
    
    const file = files[0];
    const contentType = file.contentType || file.metadata?.contentType || 'image/png';
    
    const stream = await fileService.getFileStream(id);
    
    res.set({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400'
    });
    
    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(404).json({ success: false, error: 'Image file not found' });
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/files/:id - Generic file serving route
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid file id' });
    }
    
    const stream = await fileService.getFileStream(id);
    
    // Set generic headers - browser will determine content type
    res.set({
      'Accept-Ranges': 'bytes'
    });
    
    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(404).json({ success: false, error: 'File not found' });
      }
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;

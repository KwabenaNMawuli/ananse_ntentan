const multer = require('multer');

// Configure storage
const storage = multer.memoryStorage();

// Filter for audio and image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Please upload an audio or image file.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Math.max(
      parseInt(process.env.MAX_FILE_SIZE_AUDIO) || 10 * 1024 * 1024,
      parseInt(process.env.MAX_FILE_SIZE_IMAGE) || 5 * 1024 * 1024
    )
  }
});

module.exports = upload;
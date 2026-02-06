const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['speak', 'write', 'sketch'],
    required: true
  },
  originalContent: {
    text: String,
    audioFileId: mongoose.Schema.Types.ObjectId,
    imageFileId: mongoose.Schema.Types.ObjectId,
    transcription: String
  },
  visualNarrative: {
    panels: [{
      number: Number,
      description: String,
      dialogue: String,
      scene: String,
      imageFileId: mongoose.Schema.Types.ObjectId // Generated panel image
    }],
    style: String,
    videoFileId: mongoose.Schema.Types.ObjectId, // Generated animated video
    videoDuration: Number // Duration in seconds
  },
  audioNarrative: {
    script: String,
    audioFileId: mongoose.Schema.Types.ObjectId,
    duration: Number,
    style: String
  },
  visualStyleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtisticStyle'
  },
  audioStyleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AudioStyle'
  },
  promptTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromptTemplate'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'complete', 'failed'],
    default: 'pending'
  },
  processingTime: Number,
  errorMessage: String,
  metadata: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
storySchema.index({ createdAt: -1 });
storySchema.index({ status: 1 });
storySchema.index({ type: 1 });

module.exports = mongoose.model('Story', storySchema);

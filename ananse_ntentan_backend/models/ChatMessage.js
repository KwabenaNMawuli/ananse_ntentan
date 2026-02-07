const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'system', 'visual'],
    default: 'text'
  },
  // For visual messages: array of 2-5 panels
  panels: [{
    number: { type: Number },
    description: { type: String },
    dialogue: { type: String },
    scene: { type: String },
    imageFileId: { type: mongoose.Schema.Types.ObjectId }
  }],
  // Track visual message status
  visualStatus: {
    type: String,
    enum: ['pending', 'generating', 'complete', 'failed'],
    default: 'pending'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });
chatMessageSchema.index({ senderId: 1, type: 1, createdAt: 1 }); // For daily limit queries

module.exports = mongoose.model('ChatMessage', chatMessageSchema);


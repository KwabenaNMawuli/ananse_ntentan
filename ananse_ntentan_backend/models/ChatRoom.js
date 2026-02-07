const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Auto-manages createdAt and updatedAt
});

// Virtual populate messages
chatRoomSchema.virtual('messages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'roomId'
});

// Ensure participants array has exactly 2 members
// Using modern async pattern - throw error instead of next()
chatRoomSchema.pre('save', function() {
  if (this.participants.length !== 2) {
    throw new Error('Chat room must have exactly 2 participants');
  }
});

// Index for faster queries
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);

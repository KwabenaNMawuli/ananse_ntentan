const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }],
  active: {
    type: Boolean,
    default: true
  },
  // Stores the AI's reasoning state for multi-turn story continuity
  thoughtSignature: {
    type: String,
    default: null
  },
  // Stores story context for the room (character names, plot points, etc.)
  storyContext: {
    type: String,
    default: null
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

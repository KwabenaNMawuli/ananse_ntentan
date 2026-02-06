const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual populate messages
chatRoomSchema.virtual('messages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'roomId'
});

// Ensure participants array has exactly 2 members
chatRoomSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('Chat room must have exactly 2 participants'));
  } else {
    next();
  }
});

// Index for faster queries
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);

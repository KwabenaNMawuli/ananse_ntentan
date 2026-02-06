const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

// Get user's chat rooms
router.get('/rooms/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const rooms = await ChatRoom.find({
      participants: userId,
      messages: { $exists: true, $not: { $size: 0 } }
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 }
      });

    const formattedRooms = rooms.map(room => ({
      roomId: room._id,
      participants: room.participants,
      lastMessage: room.updatedAt,
      lastMessageText: room.messages[0]?.content || 'No messages yet',
      createdAt: room.createdAt
    }));

    res.json({ rooms: formattedRooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Get messages for a specific room
router.get('/room/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new chat room
router.post('/room/create', async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length !== 2) {
      return res.status(400).json({ error: 'Exactly 2 participants required' });
    }

    // Check if room already exists
    const existingRoom = await ChatRoom.findOne({
      participants: { $all: participants }
    });

    if (existingRoom) {
      return res.json({ roomId: existingRoom._id, existing: true });
    }

    // Create new room
    const room = new ChatRoom({
      participants,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await room.save();
    res.json({ roomId: room._id, existing: false });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// Delete a chat room (cleanup)
router.delete('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Delete all messages
    await ChatMessage.deleteMany({ roomId });
    
    // Delete room
    await ChatRoom.findByIdAndDelete(roomId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete chat room' });
  }
});

module.exports = router;

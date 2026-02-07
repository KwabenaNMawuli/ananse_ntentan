require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const WebSocket = require('ws');
// const mongoSanitize = require('express-mongo-sanitize'); // Disabled - Express 5 compatibility issue
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const ChatRoom = require('./models/ChatRoom');
const ChatMessage = require('./models/ChatMessage');
const visualChatService = require('./services/visualChatService');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(mongoSanitize()); // Disabled - Express 5 compatibility issue

// Routes
app.use('/api/stories', require('./routes/stories'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/styles', require('./routes/styles'));
app.use('/api/files', require('./routes/files'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// WebSocket Setup
const wss = new WebSocket.Server({ server });

// Store active connections
const clients = new Map(); // userId -> WebSocket
const waitingQueue = []; // Users waiting for random match

wss.on('connection', (ws) => {
  let userId = null;
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'register':
          userId = data.userId;
          clients.set(userId, ws);
          console.log(`User registered: ${userId}`);
          break;
          
        case 'find_match':
          if (data.matchType === 'random') {
            // Check if user already in queue
            if (waitingQueue.includes(userId)) {
              ws.send(JSON.stringify({
                type: 'already_searching',
                message: 'You are already searching for a wanderer...'
              }));
              break;
            }
            
            // Clean up disconnected users from queue first
            const activeQueue = waitingQueue.filter(queuedUserId => {
              const queuedWs = clients.get(queuedUserId);
              return queuedWs && queuedWs.readyState === WebSocket.OPEN;
            });
            waitingQueue.length = 0;
            waitingQueue.push(...activeQueue);
            
            // Try to match with someone in queue
            if (waitingQueue.length > 0) {
              const partnerId = waitingQueue.shift();
              const partnerWs = clients.get(partnerId);
              
              if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
                // Create room
                const room = new ChatRoom({
                  participants: [userId, partnerId]
                });
                await room.save();
                
                // Notify both users
                ws.send(JSON.stringify({
                  type: 'match_found',
                  room: room._id.toString(),
                  partnerId: partnerId
                }));
                
                partnerWs.send(JSON.stringify({
                  type: 'match_found',
                  room: room._id.toString(),
                  partnerId: userId
                }));
                
                console.log(`Match created: ${userId} <-> ${partnerId}`);
              } else {
                // Partner disconnected, notify current user they're now waiting
                waitingQueue.push(userId);
                ws.send(JSON.stringify({
                  type: 'waiting',
                  message: 'No other wanderers online. Waiting for someone to join...',
                  position: 1
                }));
                console.log(`User ${userId} added to waiting queue (partner was disconnected)`);
              }
            } else {
              // No one in queue - add user and notify they're waiting
              waitingQueue.push(userId);
              ws.send(JSON.stringify({
                type: 'waiting',
                message: 'No other wanderers online. Waiting for someone to join...',
                position: 1
              }));
              console.log(`User ${userId} added to waiting queue (first in queue)`);
            }
          }
          break;
          
        case 'send_message':
          const { roomId, content } = data;
          
          // Save message to database
          const message = new ChatMessage({
            roomId,
            senderId: userId,
            content,
            type: 'text'
          });
          await message.save();
          
          // Update room timestamp
          await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() });
          
          // Get room to find other participant
          const room = await ChatRoom.findById(roomId);
          if (room) {
            const otherParticipant = room.participants.find(p => p !== userId);
            const otherWs = clients.get(otherParticipant);
            
            if (otherWs && otherWs.readyState === WebSocket.OPEN) {
              otherWs.send(JSON.stringify({
                type: 'message',
                roomId,
                senderId: userId,
                content,
                timestamp: message.createdAt
              }));
            }
          }
          break;
          
        case 'send_visual_message':
          // Visual chat: generate 2-5 panel story from text
          const { roomId: visualRoomId, content: visualContent, panelCount } = data;
          
          try {
            // Check daily limit
            const limitCheck = await visualChatService.checkDailyLimit(userId);
            if (!limitCheck.allowed) {
              ws.send(JSON.stringify({
                type: 'visual_limit_reached',
                message: `Daily limit reached (${limitCheck.limit} visual messages). Try again tomorrow!`,
                used: limitCheck.used,
                limit: limitCheck.limit
              }));
              break;
            }
            
            // Notify sender that generation is starting
            ws.send(JSON.stringify({
              type: 'visual_generating',
              message: 'Generating your visual story...',
              remaining: limitCheck.remaining - 1
            }));
            
            // Create pending message
            const visualMessage = new ChatMessage({
              roomId: visualRoomId,
              senderId: userId,
              content: visualContent,
              type: 'visual',
              visualStatus: 'generating',
              panels: []
            });
            await visualMessage.save();
            
            // Generate visual story (async)
            const visualData = await visualChatService.processVisualMessage(
              visualContent, 
              panelCount || 3
            );
            
            // Update message with panels
            visualMessage.panels = visualData.panels;
            visualMessage.visualStatus = 'complete';
            await visualMessage.save();
            
            // Update room timestamp
            await ChatRoom.findByIdAndUpdate(visualRoomId, { updatedAt: new Date() });
            
            // Get room to find other participant
            const visualRoom = await ChatRoom.findById(visualRoomId);
            
            const visualMessageData = {
              type: 'visual_message',
              roomId: visualRoomId,
              messageId: visualMessage._id.toString(),
              senderId: userId,
              content: visualContent,
              title: visualData.title,
              panels: visualData.panels.map(p => ({
                number: p.number,
                description: p.description,
                dialogue: p.dialogue,
                scene: p.scene,
                imageFileId: p.imageFileId?.toString()
              })),
              timestamp: visualMessage.createdAt
            };
            
            // Send to sender
            ws.send(JSON.stringify(visualMessageData));
            
            // Send to other participant
            if (visualRoom) {
              const otherParticipant = visualRoom.participants.find(p => p !== userId);
              const otherWs = clients.get(otherParticipant);
              
              if (otherWs && otherWs.readyState === WebSocket.OPEN) {
                otherWs.send(JSON.stringify(visualMessageData));
              }
            }
            
            console.log(`✅ Visual message sent: ${visualData.title} (${visualData.panels.length} panels)`);
          } catch (error) {
            console.error('Visual message error:', error);
            ws.send(JSON.stringify({
              type: 'visual_error',
              message: 'Failed to generate visual story. Please try again.',
              error: error.message
            }));
          }
          break;
          
        case 'join_room':
          const { roomId: joinRoomId } = data;
          
          // Send room history
          const messages = await ChatMessage.find({ roomId: joinRoomId })
            .sort({ createdAt: 1 })
            .limit(50);
          
          ws.send(JSON.stringify({
            type: 'room_history',
            roomId: joinRoomId,
            messages: messages.map(msg => ({
              senderId: msg.senderId,
              content: msg.content,
              timestamp: msg.createdAt
            }))
          }));
          break;
          
        case 'leave_room':
          const { roomId: leaveRoomId } = data;
          
          // Notify other participant
          const leaveRoom = await ChatRoom.findById(leaveRoomId);
          if (leaveRoom) {
            const otherParticipant = leaveRoom.participants.find(p => p !== userId);
            const otherWs = clients.get(otherParticipant);
            
            if (otherWs && otherWs.readyState === WebSocket.OPEN) {
              otherWs.send(JSON.stringify({
                type: 'user_disconnected',
                roomId: leaveRoomId
              }));
            }
          }
          break;
          
        case 'get_rooms':
          const rooms = await ChatRoom.find({
            participants: userId,
          })
            .sort({ updatedAt: -1 })
            .limit(20);
          
          const roomsWithMessages = await Promise.all(
            rooms.map(async (room) => {
              const lastMessage = await ChatMessage.findOne({ roomId: room._id })
                .sort({ createdAt: -1 });
              
              return {
                roomId: room._id.toString(),
                participants: room.participants,
                lastMessage: room.updatedAt,
                lastMessageText: lastMessage?.content || 'No messages yet'
              };
            })
          );
          
          ws.send(JSON.stringify({
            type: 'rooms_list',
            rooms: roomsWithMessages
          }));
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      // Remove from waiting queue if present
      const queueIndex = waitingQueue.indexOf(userId);
      if (queueIndex > -1) {
        waitingQueue.splice(queueIndex, 1);
      }
      console.log(`User disconnected: ${userId}`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket connection error:', error);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💬 WebSocket server ready`);
});

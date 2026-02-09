/**
 * Chat AI Service
 * 
 * Provides AI-powered responses in chat using thought signatures
 * for maintaining continuity across multi-turn conversations.
 * 
 * This enables "Marathon" storytelling where the AI remembers
 * plot points, characters, and reasoning across sessions.
 */

const genaiClient = require('./genaiClient');
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

class ChatAIService {
  constructor() {
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Generate an AI response to a chat message with thought signature continuity
   * 
   * @param {string} roomId - The chat room ID
   * @param {string} userMessage - The user's message
   * @param {Object} options - Optional settings
   * @returns {Object} - { response: string, thoughtSignature: string|null }
   */
  async generateChatResponse(roomId, userMessage, options = {}) {
    try {
      // Get room with existing thought signature
      const room = await ChatRoom.findById(roomId);
      if (!room) {
        throw new Error('Chat room not found');
      }

      // Get recent chat history for context
      const recentMessages = await ChatMessage.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(10);
      
      // Build conversation history
      const conversationHistory = recentMessages
        .reverse()
        .map(msg => `${msg.senderId === 'AI' ? 'AI' : 'User'}: ${msg.content}`)
        .join('\n');

      // Build the prompt with story context
      const systemPrompt = `You are Ananse, a wise and creative storytelling AI inspired by Akan folklore.
You are engaged in a collaborative storytelling chat. Your role is to:
1. Continue the story naturally based on what the user says
2. Maintain consistency with characters, plot, and world established earlier
3. Be creative but respect the established narrative
4. Keep responses conversational and engaging (2-4 sentences usually)

${room.storyContext ? `STORY CONTEXT (remember this):\n${room.storyContext}\n` : ''}

RECENT CONVERSATION:
${conversationHistory}

User's new message: ${userMessage}

Respond as Ananse, continuing the story or conversation naturally:`;

      // Build request with thought signature if available
      const requestConfig = {
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        config: {
          thinkingConfig: {
            thinkingLevel: options.thinkingLevel || 'HIGH'
          }
        }
      };

      console.log(`💬 Generating AI chat response for room ${roomId}...`);
      if (room.thoughtSignature) {
        console.log('📜 Using existing thought signature for continuity');
      }

      const response = await genaiClient.models.generateContent(requestConfig);
      const aiResponse = response.text;

      // Capture new thought signature
      const newThoughtSignature = response.candidates?.[0]?.thoughtSignature || room.thoughtSignature;

      // Update story context periodically (every 5 messages)
      const messageCount = await ChatMessage.countDocuments({ roomId });
      if (messageCount % 5 === 0) {
        await this.updateStoryContext(roomId, room);
      }

      // Save thought signature to room
      if (newThoughtSignature !== room.thoughtSignature) {
        await ChatRoom.findByIdAndUpdate(roomId, {
          thoughtSignature: newThoughtSignature
        });
        console.log('💭 Updated thought signature for future continuity');
      }

      return {
        response: aiResponse,
        thoughtSignature: newThoughtSignature
      };
    } catch (error) {
      console.error('Chat AI error:', error);
      throw error;
    }
  }

  /**
   * Update the story context summary for a room
   * This helps maintain long-term memory even without thought signatures
   */
  async updateStoryContext(roomId, room) {
    try {
      const messages = await ChatMessage.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(50);

      if (messages.length < 5) return;

      const conversation = messages
        .map(msg => `${msg.senderId === 'AI' ? 'AI' : 'User'}: ${msg.content}`)
        .join('\n');

      const summaryPrompt = `Summarize the key story elements from this conversation in a concise format:
- Main characters introduced
- Key plot points
- Current situation/conflict
- Important world details

CONVERSATION:
${conversation}

SUMMARY (keep under 500 words):`;

      const response = await genaiClient.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
        config: {
          thinkingConfig: { thinkingLevel: 'LOW' }
        }
      });

      const summary = response.text;
      await ChatRoom.findByIdAndUpdate(roomId, {
        storyContext: summary
      });

      console.log('📚 Updated story context for room', roomId);
    } catch (error) {
      console.error('Failed to update story context:', error);
      // Non-fatal, continue without update
    }
  }

  /**
   * Start a new collaborative story in a chat room
   */
  async startStory(roomId, initialPrompt) {
    try {
      const startPrompt = `You are Ananse, a wise storytelling AI. The user wants to start a collaborative story.
Based on their prompt, begin an engaging story opening (3-4 sentences).
Set the scene, introduce a character or situation, and leave room for the user to continue.

User's story idea: ${initialPrompt}

Begin the story:`;

      const response = await genaiClient.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: startPrompt }] }],
        config: {
          thinkingConfig: { thinkingLevel: 'HIGH' }
        }
      });

      const storyOpening = response.text;
      const thoughtSignature = response.candidates?.[0]?.thoughtSignature || null;

      // Save initial thought signature
      await ChatRoom.findByIdAndUpdate(roomId, {
        thoughtSignature,
        storyContext: `Story premise: ${initialPrompt}`
      });

      return {
        response: storyOpening,
        thoughtSignature
      };
    } catch (error) {
      console.error('Start story error:', error);
      throw error;
    }
  }
}

module.exports = new ChatAIService();

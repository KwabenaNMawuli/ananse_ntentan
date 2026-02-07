const GeminiService = require('./geminiService');
const imageService = require('./imageService');
const mongoose = require('mongoose');

// GridFS for image storage
let gfsBucket;

// Initialize GridFS bucket
const initGridFS = () => {
  if (!gfsBucket && mongoose.connection.readyState === 1) {
    gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'chatImages'
    });
  }
  return gfsBucket;
};

/**
 * Visual Chat Service
 * Generates AI visual stories (2-5 panels) from user text for chat
 */
class VisualChatService {
  constructor() {
    this.geminiService = GeminiService;
    this.dailyLimit = parseInt(process.env.VISUAL_CHAT_DAILY_LIMIT) || 5;
  }

  /**
   * Check if user has exceeded daily visual message limit
   * @param {string} senderId - User's anonymous ID
   * @returns {Object} - { allowed: boolean, remaining: number, used: number }
   */
  async checkDailyLimit(senderId) {
    const ChatMessage = require('../models/ChatMessage');
    
    // Get start of today (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Count visual messages sent today by this user
    const usedToday = await ChatMessage.countDocuments({
      senderId,
      type: 'visual',
      createdAt: { $gte: today }
    });
    
    return {
      allowed: usedToday < this.dailyLimit,
      remaining: Math.max(0, this.dailyLimit - usedToday),
      used: usedToday,
      limit: this.dailyLimit
    };
  }

  /**
   * Generate a visual story from user text
   * @param {string} userText - The user's message/prompt
   * @param {number} panelCount - Number of panels (2-5)
   * @returns {Object} - { panels: [...], title: string }
   */
  async generateVisualStory(userText, panelCount = 3) {
    // Clamp panel count to 2-5
    const numPanels = Math.min(5, Math.max(2, panelCount));
    
    // Generate story structure using Gemini
    const storyPrompt = `
You are a visual storyteller. Create a short ${numPanels}-panel comic/story based on this user message:

"${userText}"

Return ONLY valid JSON in this exact format:
{
  "title": "Short story title",
  "panels": [
    {
      "number": 1,
      "scene": "Brief scene description for image generation",
      "description": "Detailed visual description for AI image generation",
      "dialogue": "What characters say or narration text (keep short)"
    }
  ]
}

Rules:
- Create exactly ${numPanels} panels
- Make descriptions vivid and visual for image generation
- Keep dialogue/narration under 100 characters per panel
- Tell a cohesive mini-story with beginning, middle, end
- Style: dramatic, comic book aesthetic
`;

    try {
      const response = await this.geminiService.generateText(storyPrompt);
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse story structure from AI response');
      }
      
      const storyData = JSON.parse(jsonMatch[0]);
      
      // Validate panel count
      if (!storyData.panels || storyData.panels.length < 2) {
        throw new Error('Invalid story structure: not enough panels');
      }
      
      return storyData;
    } catch (error) {
      console.error('Failed to generate visual story structure:', error);
      throw error;
    }
  }

  /**
   * Generate images for all panels and store in GridFS
   * @param {Array} panels - Array of panel objects
   * @returns {Array} - Panels with imageFileId populated
   */
  async generateAndStorePanelImages(panels) {
    const bucket = initGridFS();
    if (!bucket) {
      throw new Error('GridFS not initialized');
    }

    const visualStyle = {
      promptModifiers: [
        'comic book style',
        'dramatic lighting',
        'vivid colors',
        'professional illustration',
        'high quality'
      ]
    };

    const processedPanels = [];

    for (const panel of panels) {
      try {
        console.log(`🎨 Generating image for visual chat panel ${panel.number}...`);
        
        // Generate image
        const imageBuffer = await imageService.generatePanelImage(panel, visualStyle);
        
        if (imageBuffer) {
          // Store in GridFS
          const fileId = new mongoose.Types.ObjectId();
          const uploadStream = bucket.openUploadStreamWithId(fileId, `chat_panel_${panel.number}.png`, {
            contentType: imageBuffer.contentType || 'image/png'
          });
          
          await new Promise((resolve, reject) => {
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
            uploadStream.write(imageBuffer);
            uploadStream.end();
          });
          
          processedPanels.push({
            ...panel,
            imageFileId: fileId
          });
          
          console.log(`✅ Panel ${panel.number} image stored with ID: ${fileId}`);
        } else {
          processedPanels.push({ ...panel, imageFileId: null });
        }
        
        // Small delay between panel generations
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to generate image for panel ${panel.number}:`, error.message);
        processedPanels.push({ ...panel, imageFileId: null });
      }
    }

    return processedPanels;
  }

  /**
   * Full visual message generation pipeline
   * @param {string} userText - User's text input
   * @param {number} panelCount - Number of panels (2-5)
   * @returns {Object} - Complete visual message data
   */
  async processVisualMessage(userText, panelCount = 3) {
    console.log(`🔮 Processing visual chat message: "${userText.substring(0, 50)}..."`);
    
    // Step 1: Generate story structure
    const storyData = await this.generateVisualStory(userText, panelCount);
    console.log(`📖 Story structure generated: ${storyData.title}`);
    
    // Step 2: Generate and store images
    const panelsWithImages = await this.generateAndStorePanelImages(storyData.panels);
    
    return {
      title: storyData.title,
      panels: panelsWithImages,
      originalText: userText
    };
  }
}

module.exports = new VisualChatService();

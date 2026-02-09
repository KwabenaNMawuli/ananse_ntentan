/**
 * Agent Tools
 * 
 * Defines tools that Gemini can call autonomously during story generation.
 * This bridges the AI with your existing MongoDB and file storage systems.
 * 
 * When Gemini "decides" to save a story or generate an image, it calls
 * these functions through the SDK's function calling mechanism.
 */

const Story = require('../models/Story');
const ArtisticStyle = require('../models/ArtisticStyle');
const imageService = require('./imageService');
const fileService = require('./fileService');

/**
 * Tool definitions for Gemini function calling
 * These describe what each tool does so the AI knows when to use them
 */
const toolDefinitions = [
  {
    name: 'saveStoryToDB',
    description: 'Saves a completed story with its panels to the MongoDB database. Use this when the story generation is complete and ready to be persisted.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the story'
        },
        panels: {
          type: 'array',
          description: 'Array of story panels',
          items: {
            type: 'object',
            properties: {
              number: { type: 'number', description: 'Panel number (1-based)' },
              scene: { type: 'string', description: 'Scene setting description' },
              description: { type: 'string', description: 'What happens in this panel' },
              dialogue: { type: 'string', description: 'Character dialogue' }
            },
            required: ['number', 'description']
          }
        },
        mood: {
          type: 'string',
          description: 'Overall mood of the story (e.g., "mysterious", "joyful", "tense")'
        }
      },
      required: ['title', 'panels']
    }
  },
  {
    name: 'searchSimilarStories',
    description: 'Search for existing stories in the database that match a theme or keyword. Use this to avoid duplicate storylines or to find inspiration.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for finding similar stories'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 5)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'getArtisticStyles',
    description: 'Retrieve available artistic styles for story visualization. Use this when the user asks about style options.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category filter (e.g., "traditional", "modern", "cyberpunk")'
        }
      }
    }
  },
  {
    name: 'generateCharacterReference',
    description: 'Generate a reference image for a character to maintain consistency across panels. Use this when introducing a new main character.',
    parameters: {
      type: 'object',
      properties: {
        characterName: {
          type: 'string',
          description: 'Name of the character'
        },
        appearance: {
          type: 'string',
          description: 'Detailed description of the character\'s appearance'
        },
        style: {
          type: 'string',
          description: 'Visual style for the character (e.g., "anime", "realistic", "comic book")'
        }
      },
      required: ['characterName', 'appearance']
    }
  }
];

/**
 * Tool implementations - actual functions that execute when called
 */
const toolImplementations = {
  /**
   * Save a story to the database
   */
  async saveStoryToDB({ title, panels, mood }) {
    try {
      console.log(`🔧 Tool: Saving story "${title}" with ${panels.length} panels...`);
      
      const story = new Story({
        type: 'write',
        originalContent: { text: title },
        visualNarrative: {
          panels: panels.map((p, i) => ({
            number: p.number || i + 1,
            scene: p.scene || '',
            description: p.description,
            dialogue: p.dialogue || ''
          })),
          style: mood || 'default'
        },
        status: 'complete'
      });
      
      await story.save();
      console.log(`✅ Story saved with ID: ${story._id}`);
      
      return {
        success: true,
        storyId: story._id.toString(),
        message: `Story "${title}" saved successfully`
      };
    } catch (error) {
      console.error('Tool error (saveStoryToDB):', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Search for similar stories
   */
  async searchSimilarStories({ query, limit = 5 }) {
    try {
      console.log(`🔧 Tool: Searching for stories matching "${query}"...`);
      
      const stories = await Story.find({
        $or: [
          { 'originalContent.text': { $regex: query, $options: 'i' } },
          { 'visualNarrative.panels.description': { $regex: query, $options: 'i' } }
        ]
      })
        .limit(limit)
        .select('_id originalContent.text visualNarrative.style createdAt')
        .lean();
      
      console.log(`✅ Found ${stories.length} matching stories`);
      
      return {
        success: true,
        count: stories.length,
        stories: stories.map(s => ({
          id: s._id.toString(),
          excerpt: s.originalContent?.text?.substring(0, 100) || 'No excerpt',
          style: s.visualNarrative?.style || 'unknown',
          createdAt: s.createdAt
        }))
      };
    } catch (error) {
      console.error('Tool error (searchSimilarStories):', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get available artistic styles
   */
  async getArtisticStyles({ category }) {
    try {
      console.log(`🔧 Tool: Fetching artistic styles${category ? ` (category: ${category})` : ''}...`);
      
      const query = category ? { category } : {};
      const styles = await ArtisticStyle.find(query)
        .select('name slug description promptModifiers')
        .lean();
      
      console.log(`✅ Found ${styles.length} styles`);
      
      return {
        success: true,
        count: styles.length,
        styles: styles.map(s => ({
          name: s.name,
          slug: s.slug,
          description: s.description,
          modifiers: s.promptModifiers
        }))
      };
    } catch (error) {
      console.error('Tool error (getArtisticStyles):', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Generate a character reference image
   */
  async generateCharacterReference({ characterName, appearance, style = 'comic book' }) {
    try {
      console.log(`🔧 Tool: Generating reference for character "${characterName}"...`);
      
      const prompt = `Character reference sheet for ${characterName}: ${appearance}. Style: ${style}. Full body, front view, detailed, professional character design.`;
      
      const panel = {
        number: 1,
        scene: 'Character Reference',
        description: prompt,
        dialogue: ''
      };
      
      const imageBuffer = await imageService.generatePanelImage(panel, { promptModifiers: [style] });
      
      if (imageBuffer) {
        const fileId = await fileService.uploadFile(
          imageBuffer,
          `character-ref-${characterName.toLowerCase().replace(/\s+/g, '-')}.png`,
          { type: 'character-reference', characterName }
        );
        
        console.log(`✅ Character reference generated: ${fileId}`);
        
        return {
          success: true,
          characterName,
          imageFileId: fileId.toString(),
          message: `Reference image for ${characterName} generated successfully`
        };
      }
      
      return {
        success: false,
        error: 'Image generation returned no data'
      };
    } catch (error) {
      console.error('Tool error (generateCharacterReference):', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Execute a tool call from Gemini
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Arguments passed by Gemini
 * @returns {Object} - Result of the tool execution
 */
async function executeTool(toolName, args) {
  const implementation = toolImplementations[toolName];
  
  if (!implementation) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`
    };
  }
  
  return await implementation(args);
}

/**
 * Get tool definitions in Gemini SDK format
 */
function getToolsForGemini() {
  return toolDefinitions.map(tool => ({
    functionDeclarations: [{
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }]
  }));
}

module.exports = {
  toolDefinitions,
  toolImplementations,
  executeTool,
  getToolsForGemini
};

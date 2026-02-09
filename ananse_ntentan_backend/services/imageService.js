const axios = require('axios');
const genaiClient = require('./genaiClient');

/**
 * ImageService - Handles image generation for story panels
 * 
 * Supports multiple backends:
 * 1. Gemini Image models (Nano Banana / Nano Banana Pro) - Gemini API image output
 * 2. Google Imagen 3 (via Vertex AI) - Premium quality
 * 3. Stability AI (Stable Diffusion) - Good alternative
 */
class ImageService {
  constructor() {
    this.provider = process.env.IMAGE_PROVIDER || 'gemini-image'; // default to Gemini image
    this.stabilityToken = process.env.STABILITY_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    
    // genaiClient is already initialized with API key
  }

  /**
   * Generate an image for a story panel
   * @param {Object} panel - Panel with description, dialogue, scene
   * @param {Object} visualStyle - Visual style object with modifiers
   * @param {Object} [options] - Optional settings (e.g., model override)
   * @param {string} [options.model] - Override model for this request
   * @returns {Buffer} - Image buffer
   */
  async generatePanelImage(panel, visualStyle, options = {}) {
    const prompt = this.buildImagePrompt(panel, visualStyle);
    
    console.log(`🎨 Generating image for panel ${panel.number} using ${this.provider}...`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    try {
      switch (this.provider) {
        case 'stability':
          return await this.generateWithStability(prompt);
        
        case 'imagen':
          return await this.generateWithImagen(prompt);

        case 'gemini-image':
          return await this.generateWithGeminiImage(prompt, options.model);
        
        default:
          throw new Error(`Unknown image provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`❌ Image generation failed for panel ${panel.number}:`, error.message);
      throw error;
    }
  }

  /**
   * Build comprehensive image generation prompt
   */
  buildImagePrompt(panel, visualStyle) {
    const parts = [];

    // Base scene description
    if (panel.scene) {
      parts.push(panel.scene);
    }
    
    // Add detailed description
    if (panel.description) {
      parts.push(panel.description);
    }

    // Add character dialogue context (helps with character positioning)
    if (panel.dialogue) {
      parts.push(`Characters are saying: "${panel.dialogue}"`);
    }

    // Apply visual style modifiers
    if (visualStyle && visualStyle.promptModifiers) {
      parts.push(visualStyle.promptModifiers.join(', '));
    }

    // Add quality modifiers for better output
    parts.push('high quality, detailed, comic book panel, professional illustration');

    return parts.join('. ');
  }

  /**
   * Generate image using Stability AI (Stable Diffusion)
   * Premium option with better quality control
   */
  async generateWithStability(prompt) {
    if (!this.stabilityToken) {
      throw new Error('STABILITY_API_KEY not configured');
    }

    const engineId = process.env.STABILITY_ENGINE || 'stable-diffusion-xl-1024-v1-0';
    const url = `https://api.stability.ai/v1/generation/${engineId}/text-to-image`;

    try {
      const response = await axios.post(
        url,
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.stabilityToken}`
          },
          timeout: 60000
        }
      );

      if (response.data.artifacts && response.data.artifacts.length > 0) {
        const imageBase64 = response.data.artifacts[0].base64;
        console.log('✅ Image generated successfully with Stability AI');
        return Buffer.from(imageBase64, 'base64');
      } else {
        throw new Error('No image artifacts returned from Stability AI');
      }
    } catch (error) {
      console.error('Stability AI error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate image using Gemini Image models (Nano Banana / Nano Banana Pro)
   * Uses Gemini API image output (inlineData)
   */
  async generateWithGeminiImage(prompt, modelOverride = null) {
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const model = modelOverride || process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const aspectRatio = process.env.GEMINI_IMAGE_ASPECT_RATIO || '1:1';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`;

    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: { aspectRatio }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const parts = response.data?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(part => part.inlineData && part.inlineData.data);

      if (!imagePart) {
        throw new Error('No image data returned from Gemini image model');
      }

      const imageBase64 = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || 'image/png';
      console.log(`✅ Image generated successfully with Gemini Image model (${mimeType})`);
      
      const buffer = Buffer.from(imageBase64, 'base64');
      
      // Add metadata to buffer for content type tracking
      buffer.contentType = mimeType;
      
      return buffer;
    } catch (error) {
      console.error('Gemini Image API error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate image using Google Imagen 3
   * Note: Requires Vertex AI setup and may have limited availability
   */
  async generateWithImagen(prompt) {
    // Note: Google Imagen 3 is typically accessed via Vertex AI
    // This is a placeholder for future implementation
    console.warn('⚠️ Imagen provider selected but not fully implemented');
    throw new Error('Imagen provider is not implemented yet');
  }

  /**
   * Generate images for all panels in a story
   * @param {Array} panels - Array of panel objects
   * @param {Object} visualStyle - Visual style object
   * @returns {Array} - Array of buffers matching panel order
   */
  async generateAllPanelImages(panels, visualStyle, options = {}) {
    console.log(`🎨 Generating images for ${panels.length} panels...`);
    
    const imageBuffers = [];
    
    // Generate images sequentially to avoid rate limits
    // TODO: Could parallelize with rate limiting in production
    for (const panel of panels) {
      try {
        const imageBuffer = await this.generatePanelImage(panel, visualStyle, options);
        imageBuffers.push(imageBuffer);
        
        // Add small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate image for panel ${panel.number}:`, error.message);
        // Push null for failed panels - can be handled later
        imageBuffers.push(null);
      }
    }

    const successCount = imageBuffers.filter(b => b !== null).length;
    console.log(`✅ Generated ${successCount}/${panels.length} panel images successfully`);
    
    return imageBuffers;
  }
}

module.exports = new ImageService();

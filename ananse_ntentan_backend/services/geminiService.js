/**
 * GeminiService - Upgraded with @google/genai SDK
 * 
 * Features:
 * - thinking_level: HIGH for complex story generation
 * - Multimodal inputs: Raw audio/images passed directly to the model
 * - thought_signature: Captured and returned for multi-turn continuity
 */

const genaiClient = require('./genaiClient');

class GeminiService {
  constructor() {
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.0-pro';
  }

  /**
   * Simple text generation without parsing
   * @param {string} prompt - The prompt to send
   * @returns {string} - Raw text response
   */
  async generateText(prompt) {
    try {
      const response = await genaiClient.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return response.text;
    } catch (error) {
      console.error('Gemini text generation error:', error);
      throw error;
    }
  }

  /**
   * Generate a story with optional multimodal inputs and high thinking
   * @param {string} userContent - The user's text input
   * @param {Object} promptTemplate - The prompt template object
   * @param {Object} visualStyle - Visual style object with modifiers
   * @param {Object} [multimodalInput] - Optional { buffer: Buffer, mimeType: string }
   * @param {Object} [options] - Optional settings { thinkingLevel, previousThoughtSignature }
   * @returns {Object} - { story: Object, thoughtSignature: string|null }
   */
  async generateStory(userContent, promptTemplate, visualStyle, multimodalInput = null, options = {}) {
    try {
      const fullPrompt = this.assemblePrompt(userContent, promptTemplate, visualStyle);
      const thinkingLevel = options.thinkingLevel || 'HIGH';

      // Build the request parts
      const parts = [];

      // If multimodal input is provided, add it first so the model "senses" it
      if (multimodalInput && multimodalInput.buffer && multimodalInput.mimeType) {
        console.log(`🎧 Including multimodal input (${multimodalInput.mimeType}) for deep sensing...`);
        parts.push({
          inlineData: {
            mimeType: multimodalInput.mimeType,
            data: multimodalInput.buffer.toString('base64')
          }
        });
        // Add instruction to sense the tone/style
        parts.push({
          text: `Pay close attention to the TONE and EMOTIONAL QUALITY of the attached media. 
          If it's audio, consider the speaker's emotion (excited, scared, calm, angry).
          If it's an image, consider the artistic style (dark, bright, messy, clean).
          Let these qualities influence the mood and style of the story you generate.\n\n`
        });
      }

      // Add the main prompt
      parts.push({ text: fullPrompt });

      // Build the request
      const requestConfig = {
        model: this.modelName,
        contents: [{ role: 'user', parts }],
        config: {
          thinkingConfig: {
            thinkingLevel: thinkingLevel
          }
        }
      };

      // If we have a previous thought signature (for multi-turn), include it
      // Note: This is typically handled via chat history, but we capture it for storage
      if (options.previousThoughtSignature) {
        console.log('📜 Using previous thought signature for continuity...');
        // The SDK handles this automatically in chat mode, but we track it for our DB
      }

      console.log(`🧠 Generating story with thinking_level: ${thinkingLevel}...`);
      const response = await genaiClient.models.generateContent(requestConfig);

      // Extract text response
      let text = response.text;
      
      // Clean up markdown formatting if present
      if (text.includes('```')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      // Capture thought signature if available (for multi-turn continuity)
      const thoughtSignature = response.candidates?.[0]?.thoughtSignature || null;
      if (thoughtSignature) {
        console.log('💭 Captured thought signature for future continuity');
      }

      // Parse and return
      const story = JSON.parse(text);
      return {
        story,
        thoughtSignature
      };
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio using Gemini's native audio understanding
   * @param {Buffer} audioBuffer - The audio data
   * @param {string} mimeType - The audio MIME type (e.g., 'audio/webm', 'audio/mp3')
   * @returns {string} - Transcribed text
   */
  async transcribeAudio(audioBuffer, mimeType = 'audio/mp3') {
    try {
      const response = await genaiClient.models.generateContent({
        model: this.modelName,
        contents: [{
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBuffer.toString('base64')
              }
            },
            { text: 'Transcribe this audio accurately:' }
          ]
        }]
      });
      
      return response.text;
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw error;
    }
  }

  /**
   * Analyze an image and describe it for story generation
   * @param {Buffer} imageBuffer - The image data
   * @param {string} mimeType - The image MIME type
   * @returns {string} - Description text
   */
  async analyzeImage(imageBuffer, mimeType = 'image/jpeg') {
    try {
      const response = await genaiClient.models.generateContent({
        model: this.modelName,
        contents: [{
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBuffer.toString('base64')
              }
            },
            { 
              text: `Analyze this image and describe the story it tells. 
              Describe the scene, characters, usage of color, mood, and any specific actions taking place. 
              Also note the ARTISTIC STYLE of the image (is it sketchy, clean, dark, bright, cartoonish, realistic?).
              This description will be used to generate a narrative story that matches the visual style.` 
            }
          ]
        }]
      });

      return response.text;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  /**
   * Assemble the full prompt from template and user input
   */
  assemblePrompt(userContent, template, visualStyle) {
    let prompt = template.promptText;
    
    // Inject user content
    prompt += `\n\nUser Story: ${userContent}`;
    
    // Inject visual style modifiers
    if (visualStyle && visualStyle.promptModifiers) {
      prompt += `\n\nVisual Style Guidelines: ${visualStyle.promptModifiers.join(', ')}`;
    }
    
    return prompt;
  }

  /**
   * Generate content with function calling enabled
   * The AI can call tools like saveStoryToDB, searchSimilarStories, etc.
   * 
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Options including tools and max iterations
   * @returns {Object} - { text: string, toolCalls: Array, toolResults: Array }
   */
  async generateWithTools(prompt, options = {}) {
    const { getToolsForGemini, executeTool } = require('./agentTools');
    
    const maxIterations = options.maxIterations || 5;
    const tools = options.tools || getToolsForGemini();
    
    let toolCallHistory = [];
    let toolResultHistory = [];
    let currentPrompt = prompt;
    let iteration = 0;

    try {
      console.log('🤖 Starting function calling session...');

      while (iteration < maxIterations) {
        iteration++;
        console.log(`   Iteration ${iteration}/${maxIterations}`);

        const response = await genaiClient.models.generateContent({
          model: this.modelName,
          contents: [{ role: 'user', parts: [{ text: currentPrompt }] }],
          tools: tools,
          config: {
            thinkingConfig: {
              thinkingLevel: options.thinkingLevel || 'HIGH'
            }
          }
        });

        // Check if the response contains function calls
        const functionCall = response.candidates?.[0]?.content?.parts?.find(
          part => part.functionCall
        );

        if (functionCall) {
          const { name, args } = functionCall.functionCall;
          console.log(`   🔧 AI called tool: ${name}`);
          
          toolCallHistory.push({ name, args, iteration });

          // Execute the tool
          const result = await executeTool(name, args);
          toolResultHistory.push({ name, result, iteration });

          // Feed the result back to the AI
          currentPrompt = `${currentPrompt}

Tool "${name}" was executed with result:
${JSON.stringify(result, null, 2)}

Continue based on this result. If you need to call more tools, do so. If you're done, provide your final response.`;
        } else {
          // No more function calls, return the final text
          console.log('✅ Function calling complete');
          
          return {
            text: response.text,
            toolCalls: toolCallHistory,
            toolResults: toolResultHistory,
            iterations: iteration
          };
        }
      }

      // Max iterations reached
      console.log('⚠️ Max iterations reached');
      return {
        text: 'Max tool call iterations reached. Please try a simpler request.',
        toolCalls: toolCallHistory,
        toolResults: toolResultHistory,
        iterations: iteration,
        maxIterationsReached: true
      };
    } catch (error) {
      console.error('Function calling error:', error);
      throw error;
    }
  }

  /**
   * Agentic story creation - AI can autonomously decide to save to DB,
   * generate character references, search for similar stories, etc.
   * 
   * @param {string} userRequest - The user's story request
   * @returns {Object} - { story: Object, actions: Array }
   */
  async agenticStoryGeneration(userRequest) {
    try {
      console.log('🕷️ Starting agentic story generation...');
      
      const prompt = `You are Ananse, a wise storytelling AI with the power to CREATE and SAVE stories.

The user wants you to create a story. You have access to these tools:
- saveStoryToDB: Save the completed story to the database
- searchSimilarStories: Check if similar stories exist
- getArtisticStyles: See available visual styles
- generateCharacterReference: Create a reference image for main characters

WORKFLOW:
1. First, search for similar stories to avoid duplicates
2. Choose an appropriate artistic style
3. Create the story with engaging panels
4. Save it to the database

User's request: ${userRequest}

Begin by searching for any similar existing stories, then proceed with creation.`;

      const result = await this.generateWithTools(prompt, {
        thinkingLevel: 'HIGH',
        maxIterations: 6
      });

      // Parse the final response for story data if present
      let story = null;
      const saveAction = result.toolResults.find(r => r.name === 'saveStoryToDB');
      if (saveAction && saveAction.result.success) {
        story = {
          id: saveAction.result.storyId,
          saved: true
        };
      }

      return {
        story,
        finalText: result.text,
        actions: result.toolCalls,
        results: result.toolResults,
        iterations: result.iterations
      };
    } catch (error) {
      console.error('Agentic generation error:', error);
      throw error;
    }
  }
}

module.exports = new GeminiService();


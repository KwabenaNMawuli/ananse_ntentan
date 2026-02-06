const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    });
  }

  async generateStory(userContent, promptTemplate, visualStyle) {
    try {
      // Assemble prompt with style modifiers
      const fullPrompt = this.assemblePrompt(
        userContent, 
        promptTemplate, 
        visualStyle
      );

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown formatting if present
      if (text.includes('```')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      // Parse JSON response
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioBuffer, mimeType = 'audio/mp3') {
    try {
      // Gemini multimodal: native audio support
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBuffer.toString('base64')
          }
        },
        { text: 'Transcribe this audio accurately:' }
      ]);
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw error;
    }
  }

  async analyzeImage(imageBuffer, mimeType = 'image/jpeg') {
    try {
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBuffer.toString('base64')
          }
        },
        { text: 'Analyze this image and describe the story it tells. Describe the scene, characters, usage of color, mood, and any specific actions taking place. This description will be used to generate a narrative story.' }
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

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
}

module.exports = new GeminiService();

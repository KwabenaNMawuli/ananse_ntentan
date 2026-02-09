const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const genaiClient = require('../services/genaiClient');
const fs = require('fs');

async function testImageGen() {
  console.log('Testing Image Generation with new SDK...');
  
  // Note: Image generation in the new SDK uses specific image models
  // This test verifies the SDK can communicate with image generation endpoints
  
  try {
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    
    console.log(`Attempting image generation with model: ${model}...`);
    
    const response = await genaiClient.models.generateContent({
      model: model,
      contents: [{ 
        parts: [{ text: 'A majestic cybernetic spider, neon colors, digital art style' }] 
      }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '1:1' }
      }
    });
    
    // Check for images in the response
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(part => part.inlineData && part.inlineData.data);
    
    if (imagePart) {
      console.log('✅ Image generation successful!');
      console.log(`   MIME type: ${imagePart.inlineData.mimeType}`);
      console.log(`   Data length: ${imagePart.inlineData.data.length} bytes`);
    } else {
      console.log('Response parts:', JSON.stringify(parts, null, 2));
    }
     
  } catch (e) {
    console.error('Image generation failed:', e.message);
  }
}

testImageGen();

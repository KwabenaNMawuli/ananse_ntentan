const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testImageGen() {
  console.log('Testing Image Generation with nano-banana-pro-preview...');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Note: specific syntax for image generation models might vary. 
  // Attempting standard generateContent likely won't return an image for a text model like Gemini.
  // But if 'nano-banana' is an image model, we check how to invoke it.
  // In many Google SDKs, image gen is separate. 
  // However, often specialized models are invoked via tool use or specific methods.
  // Let's try to assume it behaves like an image generation model where .generateImage might exist 
  // OR we pass specific params to generateContent.
  
  // Let's try simple generateContent prompt first, maybe it returns an image blob?
  try {
     const model = genAI.getGenerativeModel({ model: 'nano-banana-pro-preview' });
     
     // 1. Try standard text prompt asking for image
     // Some setups use generateContent and return inlineData.
     console.log("Attempting generation...");
     const result = await model.generateContent("A majestic cybernetic spider, neon colors, digital art style");
     const response = await result.response;
     
     // Check for images in the response
     // Usually specific fields on the response object
     console.log("Response candidates:", JSON.stringify(response.candidates, null, 2));
     
  } catch (e) {
      console.error("Standard generation failed:", e.message);
  }
}

testImageGen();

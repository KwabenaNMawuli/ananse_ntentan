const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const genaiClient = require('../services/genaiClient');

async function testGenAI() {
  console.log('Testing Gemini API Connection (new SDK)...');
  console.log(`Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log(`API Key: ${process.env.GEMINI_API_KEY ? 'Present' : 'Missing'}`);

  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is missing in .env');
    return;
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    console.log('Sending prompt: "Say hello"...');
    const response = await genaiClient.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: 'Say hello' }] }]
    });
    
    console.log('Success! Response:', response.text);
  } catch (error) {
    console.error('Gemini Error:', error.message);
    if (error.response) {
        console.error('Error details:', JSON.stringify(error.response, null, 2));
    }
  }
}

testGenAI();

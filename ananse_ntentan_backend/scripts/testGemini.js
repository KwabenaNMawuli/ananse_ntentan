const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGenAI() {
  console.log('Testing Gemini API Connection...');
  console.log(`Model: ${process.env.GEMINI_MODEL}`);
  console.log(`API Key: ${process.env.GEMINI_API_KEY ? 'Present' : 'Missing'}`);

  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is missing in .env');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // List available models
    // console.log('Listing available models...');
    // const modelList = await genAI.getGenerativeModel({ model: 'gemini-1.0-pro' }); // Dummy init to get client? No.
    // There isn't a direct listModels on genAI instance in the SDK usually, it's a separate call.
    // Checking documentation style usage:
    // It seems the SDK might not expose listModels easily on the instance.
    // Let's try to just use 'gemini-1.5-flash-001' which is the specific version.
    
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    });

    console.log('Sending prompt: "Say hello"...');
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    const text = response.text();
    
    console.log('Success! Response:', text);
  } catch (error) {
    console.error('Gemini Error:', error.message);
    if (error.response) {
        console.error('Error details:', JSON.stringify(error.response, null, 2));
    }
  }
}

testGenAI();

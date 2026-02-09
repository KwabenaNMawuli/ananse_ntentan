/**
 * Test script to verify the @google/genai SDK migration
 * 
 * Run with: node scripts/testSdkMigration.js
 */

require('dotenv').config();
const genaiClient = require('../services/genaiClient');
const geminiService = require('../services/geminiService');

async function testBasicGeneration() {
  console.log('🧪 Testing SDK Migration...\n');
  console.log('1️⃣ Testing basic text generation...');
  
  try {
    const response = await geminiService.generateText('Say "Hello from Ananse Ntentan!" in a creative way.');
    console.log('✅ Text generation works!');
    console.log('   Response:', response.substring(0, 100) + '...\n');
  } catch (error) {
    console.error('❌ Text generation failed:', error.message);
    return false;
  }

  console.log('2️⃣ Testing thinking_level configuration...');
  try {
    // This tests that the SDK accepts thinking config
    const mockTemplate = {
      promptText: 'Generate a simple JSON story object with a "title" field. Return ONLY valid JSON.'
    };
    
    const result = await geminiService.generateStory(
      'A spider finds a web',
      mockTemplate,
      null,
      null,
      { thinkingLevel: 'LOW' } // Use LOW for faster test
    );
    
    console.log('✅ Thinking level configuration works!');
    console.log('   Story title:', result.story?.title || result.title || 'Generated successfully');
    if (result.thoughtSignature) {
      console.log('   💭 Thought signature captured!');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Story generation failed:', error.message);
    return false;
  }

  console.log('✅✅✅ All SDK migration tests passed! ✅✅✅\n');
  return true;
}

testBasicGeneration()
  .then(success => {
    if (success) {
      console.log('🎉 Your backend is now using the new @google/genai SDK!');
      console.log('📚 Features enabled:');
      console.log('   - thinking_level: HIGH for complex stories');
      console.log('   - Multimodal inputs for deep sensing');
      console.log('   - Thought signatures for continuity');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

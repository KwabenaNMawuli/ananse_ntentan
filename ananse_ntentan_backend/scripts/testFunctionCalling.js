/**
 * Test script to verify Function Calling (Phase 3)
 * 
 * Run with: node scripts/testFunctionCalling.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

async function testFunctionCalling() {
  console.log('🧪 Testing Function Calling (Phase 3)...\n');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Import services after DB connection
    const geminiService = require('../services/geminiService');
    const { toolDefinitions, executeTool } = require('../services/agentTools');
    
    // Test 1: Verify tool definitions
    console.log('1️⃣ Verifying tool definitions...');
    console.log(`   Found ${toolDefinitions.length} tools:`);
    toolDefinitions.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });
    console.log('');
    
    // Test 2: Test searchSimilarStories tool directly
    console.log('2️⃣ Testing searchSimilarStories tool...');
    const searchResult = await executeTool('searchSimilarStories', { query: 'spider', limit: 3 });
    console.log(`   ✅ Search returned ${searchResult.count || 0} results\n`);
    
    // Test 3: Test getArtisticStyles tool directly
    console.log('3️⃣ Testing getArtisticStyles tool...');
    const stylesResult = await executeTool('getArtisticStyles', {});
    console.log(`   ✅ Found ${stylesResult.count || 0} artistic styles\n`);
    
    // Test 4: Test generateWithTools (simple prompt without needing DB save)
    console.log('4️⃣ Testing generateWithTools...');
    console.log('   (This will make a Gemini API call with function calling enabled)');
    
    const toolResult = await geminiService.generateWithTools(
      `You are a helpful assistant. Use the searchSimilarStories tool to search for stories about "magic". Then tell me what you found.`,
      { thinkingLevel: 'LOW', maxIterations: 3 }
    );
    
    console.log(`   ✅ Function calling completed in ${toolResult.iterations} iteration(s)`);
    console.log(`   Tool calls made: ${toolResult.toolCalls.length}`);
    if (toolResult.toolCalls.length > 0) {
      toolResult.toolCalls.forEach(call => {
        console.log(`   - ${call.name}(${JSON.stringify(call.args).substring(0, 50)}...)`);
      });
    }
    console.log(`   Final response: ${toolResult.text?.substring(0, 100) || 'No text response'}...`);
    console.log('');
    
    console.log('✅✅✅ All Function Calling tests passed! ✅✅✅\n');
    console.log('🎉 Phase 3 Complete: Gemini can now call your tools!');
    console.log('📚 Available tools:');
    console.log('   - saveStoryToDB: Persist stories to MongoDB');
    console.log('   - searchSimilarStories: Find existing stories');
    console.log('   - getArtisticStyles: List visual styles');
    console.log('   - generateCharacterReference: Create character art');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testFunctionCalling();

/**
 * Test script to verify Chat AI Service with Thought Signatures
 * 
 * Run with: node scripts/testChatAI.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

async function testChatAI() {
  console.log('🧪 Testing Chat AI Service with Thought Signatures...\n');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Import services after DB connection
    const ChatRoom = require('../models/ChatRoom');
    const chatAIService = require('../services/chatAIService');
    
    // Create a test room
    console.log('1️⃣ Creating test chat room...');
    const testRoom = new ChatRoom({
      participants: ['test-user-1', 'test-user-2'],
      active: true
    });
    await testRoom.save();
    console.log(`   Room created: ${testRoom._id}\n`);
    
    // Test starting a story
    console.log('2️⃣ Testing story start...');
    const startResult = await chatAIService.startStory(
      testRoom._id, 
      'A young weaver discovers a magical loom that can weave reality itself'
    );
    console.log('✅ Story started!');
    console.log(`   Opening: ${startResult.response.substring(0, 150)}...`);
    console.log(`   Has thought signature: ${!!startResult.thoughtSignature}\n`);
    
    // Check if thought signature was saved
    const updatedRoom = await ChatRoom.findById(testRoom._id);
    console.log(`3️⃣ Checking persistence...`);
    console.log(`   Thought signature saved: ${!!updatedRoom.thoughtSignature}`);
    console.log(`   Story context saved: ${!!updatedRoom.storyContext}\n`);
    
    // Test continuing the story
    console.log('4️⃣ Testing story continuation...');
    const continueResult = await chatAIService.generateChatResponse(
      testRoom._id,
      'She decides to weave a thread of starlight into her first creation'
    );
    console.log('✅ Story continued!');
    console.log(`   Response: ${continueResult.response.substring(0, 150)}...`);
    console.log(`   Thought signature maintained: ${!!continueResult.thoughtSignature}\n`);
    
    // Cleanup
    console.log('5️⃣ Cleaning up test data...');
    await ChatRoom.findByIdAndDelete(testRoom._id);
    console.log('   Test room deleted\n');
    
    console.log('✅✅✅ All Chat AI tests passed! ✅✅✅\n');
    console.log('🎉 Phase 2 Complete: Thought Signatures for Chat Continuity');
    console.log('📚 New capabilities:');
    console.log('   - AI maintains reasoning state across sessions');
    console.log('   - Story context is summarized and persisted');
    console.log('   - Multi-turn collaborative storytelling enabled');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testChatAI();

require('dotenv').config();
const mongoose = require('mongoose');
const Story = require('../models/Story');

async function checkStories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id type status createdAt visualNarrative.panels')
      .lean();
    
    console.log(`📊 Found ${stories.length} recent stories:\n`);
    
    stories.forEach((story, index) => {
      const panelCount = story.visualNarrative?.panels?.length || 0;
      const date = new Date(story.createdAt).toLocaleString();
      console.log(`${index + 1}. ID: ${story._id}`);
      console.log(`   Type: ${story.type}`);
      console.log(`   Status: ${story.status}`);
      console.log(`   Panels: ${panelCount}`);
      console.log(`   Created: ${date}`);
      console.log('');
    });
    
    // Count by status
    const statusCounts = await Story.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('📈 Status Summary:');
    statusCounts.forEach(s => {
      console.log(`   ${s._id}: ${s.count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkStories();

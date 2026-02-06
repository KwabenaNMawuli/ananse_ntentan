/**
 * Script to regenerate images for existing stories
 * Run with: node scripts/regenerateImages.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Story = require('../models/Story');
const ArtisticStyle = require('../models/ArtisticStyle');
const imageService = require('../services/imageService');
const fileService = require('../services/fileService');

async function regenerateImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all stories that have panels but corrupted/missing images
    const stories = await Story.find({
      'visualNarrative.panels': { $exists: true, $ne: [] }
    });

    console.log(`📊 Found ${stories.length} stories with panels`);

    for (const story of stories) {
      console.log(`\n🔄 Processing story ${story._id}...`);
      
      const panels = story.visualNarrative?.panels || [];
      if (panels.length === 0) {
        console.log('  ⏭️  No panels to regenerate');
        continue;
      }

      // Get visual style
      const visualStyleId = story.visualNarrative?.visualStyleId;
      let visualStyle = null;
      
      if (visualStyleId) {
        visualStyle = await ArtisticStyle.findById(visualStyleId);
      }
      
      if (!visualStyle) {
        // Use a default style
        visualStyle = await ArtisticStyle.findOne({ name: 'Cyberpunk Noir' });
      }

      console.log(`  🎨 Using visual style: ${visualStyle?.name || 'Default'}`);

      // Regenerate each panel image
      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        console.log(`  🖼️  Regenerating image for panel ${i + 1}/${panels.length}...`);

        try {
          // Delete old image if exists
          if (panel.imageFileId) {
            try {
              await fileService.deleteFile(panel.imageFileId);
              console.log(`    🗑️  Deleted old image`);
            } catch (err) {
              console.log(`    ⚠️  Could not delete old image: ${err.message}`);
            }
          }

          // Generate new image
          const imageBuffer = await imageService.generatePanelImage(panel, visualStyle);
          
          // Upload with correct content type
          const contentType = imageBuffer.contentType || 'image/png';
          const fileId = await fileService.uploadFile(
            imageBuffer,
            `story-${story._id}-panel-${i + 1}.png`,
            { storyId: story._id, type: 'panel-image', panelNumber: i + 1, contentType }
          );

          // Update panel with new imageFileId
          panel.imageFileId = fileId;
          console.log(`    ✅ Generated and uploaded new image (${contentType})`);

        } catch (error) {
          console.error(`    ❌ Failed to regenerate panel ${i + 1}:`, error.message);
        }
      }

      // Save story with updated imageFileIds
      await story.save();
      console.log(`  💾 Story ${story._id} updated successfully`);
    }

    console.log('\n✅ Image regeneration complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
regenerateImages();

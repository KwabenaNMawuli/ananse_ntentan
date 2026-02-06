const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
require('dotenv').config();

/**
 * Diagnostic script to check image storage and retrieval
 * Run: node scripts/diagnoseImages.js
 */

async function diagnose() {
  try {
    console.log('🔍 Starting image storage diagnostic...\n');

    // 1. Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 2. Check environment variables
    console.log('2️⃣ Checking configuration...');
    console.log(`   ENABLE_IMAGE_GENERATION: ${process.env.ENABLE_IMAGE_GENERATION}`);
    console.log(`   IMAGE_PROVIDER: ${process.env.IMAGE_PROVIDER || 'gemini-image'}`);
    console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log('');

    // 3. Check GridFS bucket
    console.log('3️⃣ Checking GridFS storage...');
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    
    // Count total files
    const allFiles = await bucket.find({}).toArray();
    console.log(`   Total files in GridFS: ${allFiles.length}`);
    
    // Count image files
    const imageFiles = await bucket.find({ 
      'metadata.type': 'panel-image' 
    }).toArray();
    console.log(`   Panel images in GridFS: ${imageFiles.length}`);
    
    if (imageFiles.length > 0) {
      console.log('\n   📸 Sample image files:');
      imageFiles.slice(0, 3).forEach(file => {
        console.log(`      - ${file._id} | ${file.filename} | ${(file.length / 1024).toFixed(2)} KB`);
      });
    }
    console.log('');

    // 4. Check stories with panels
    console.log('4️⃣ Checking stories with panels...');
    const Story = mongoose.model('Story', new mongoose.Schema({}, { strict: false }));
    
    const storiesWithPanels = await Story.find({
      'visualNarrative.panels': { $exists: true, $ne: [] }
    }).select('_id type status visualNarrative createdAt').lean();
    
    console.log(`   Stories with panels: ${storiesWithPanels.length}`);
    
    if (storiesWithPanels.length > 0) {
      console.log('\n   📚 Analyzing panel image references:');
      
      for (const story of storiesWithPanels.slice(0, 5)) {
        const panels = story.visualNarrative?.panels || [];
        const panelsWithImages = panels.filter(p => p.imageFileId);
        
        console.log(`\n   Story ${story._id}:`);
        console.log(`      Type: ${story.type} | Status: ${story.status}`);
        console.log(`      Panels: ${panels.length} | With images: ${panelsWithImages.length}`);
        
        if (panelsWithImages.length > 0) {
          // Check if referenced images exist in GridFS
          for (let i = 0; i < panelsWithImages.length; i++) {
            const panel = panelsWithImages[i];
            const imageId = panel.imageFileId;
            
            try {
              const fileExists = await bucket.find({ 
                _id: new mongoose.Types.ObjectId(imageId) 
              }).toArray();
              
              if (fileExists.length > 0) {
                console.log(`      ✅ Panel ${panel.number}: Image exists (${(fileExists[0].length / 1024).toFixed(2)} KB)`);
              } else {
                console.log(`      ❌ Panel ${panel.number}: Image ID ${imageId} NOT FOUND in GridFS`);
              }
            } catch (err) {
              console.log(`      ❌ Panel ${panel.number}: Invalid image ID format - ${imageId}`);
            }
          }
        } else {
          console.log(`      ⚠️  No panels have imageFileId references`);
        }
      }
    }
    console.log('');

    // 5. Check for orphaned images
    console.log('5️⃣ Checking for orphaned images...');
    const allStories = await Story.find({}).select('visualNarrative').lean();
    const referencedImageIds = new Set();
    
    allStories.forEach(story => {
      story.visualNarrative?.panels?.forEach(panel => {
        if (panel.imageFileId) {
          referencedImageIds.add(panel.imageFileId.toString());
        }
      });
    });
    
    const orphanedImages = imageFiles.filter(file => 
      !referencedImageIds.has(file._id.toString())
    );
    
    console.log(`   Referenced images: ${referencedImageIds.size}`);
    console.log(`   Orphaned images: ${orphanedImages.length}`);
    console.log('');

    // 6. Test image retrieval
    console.log('6️⃣ Testing image retrieval...');
    if (imageFiles.length > 0) {
      const testFile = imageFiles[0];
      console.log(`   Testing retrieval of ${testFile._id}...`);
      
      try {
        const chunks = [];
        const downloadStream = bucket.openDownloadStream(testFile._id);
        
        await new Promise((resolve, reject) => {
          downloadStream.on('data', chunk => chunks.push(chunk));
          downloadStream.on('end', resolve);
          downloadStream.on('error', reject);
        });
        
        const buffer = Buffer.concat(chunks);
        console.log(`   ✅ Successfully retrieved ${buffer.length} bytes`);
        console.log(`   Content type: ${testFile.contentType || testFile.metadata?.contentType || 'unknown'}`);
      } catch (err) {
        console.log(`   ❌ Failed to retrieve: ${err.message}`);
      }
    } else {
      console.log('   ⚠️  No images to test');
    }
    console.log('');

    // 7. Summary and recommendations
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    
    if (process.env.ENABLE_IMAGE_GENERATION !== 'true') {
      console.log('⚠️  Image generation is DISABLED');
      console.log('   → Set ENABLE_IMAGE_GENERATION=true in .env');
    }
    
    if (imageFiles.length === 0) {
      console.log('⚠️  No images found in GridFS');
      console.log('   → Images may not have been generated yet');
      console.log('   → Check backend logs for image generation errors');
    }
    
    if (storiesWithPanels.length > 0) {
      const storiesWithImageRefs = storiesWithPanels.filter(s => 
        s.visualNarrative?.panels?.some(p => p.imageFileId)
      );
      
      if (storiesWithImageRefs.length === 0) {
        console.log('⚠️  Stories have panels but no imageFileId references');
        console.log('   → Image generation may be failing silently');
        console.log('   → Run: node scripts/testImageGen.js to test generation');
      }
    }
    
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('   1. Check backend server logs for image generation errors');
    console.log('   2. Test image generation: node scripts/testImageGen.js');
    console.log('   3. Try creating a new story and watch the logs');
    console.log('   4. Check browser console for 404 errors on image URLs');
    console.log('');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

diagnose();

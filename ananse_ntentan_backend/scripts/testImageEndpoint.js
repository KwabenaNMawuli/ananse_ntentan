const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Test the image serving endpoint
 * Run: node scripts/testImageEndpoint.js
 */

async function testImageEndpoint() {
  const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
  
  console.log('🧪 Testing Image Serving Endpoint\n');
  console.log(`API Base: ${API_BASE}\n`);

  try {
    // 1. Get a story with images
    console.log('1️⃣ Fetching stories from feed...');
    const feedResponse = await axios.get(`${API_BASE}/feed?limit=5`);
    
    if (!feedResponse.data.success || feedResponse.data.stories.length === 0) {
      console.log('❌ No stories found in feed');
      return;
    }
    
    console.log(`✅ Found ${feedResponse.data.stories.length} stories\n`);
    
    // 2. Find a story with panel images
    let testStory = null;
    let testPanel = null;
    
    for (const story of feedResponse.data.stories) {
      const panels = story.visualNarrative?.panels || [];
      const panelWithImage = panels.find(p => p.imageFileId);
      
      if (panelWithImage) {
        testStory = story;
        testPanel = panelWithImage;
        break;
      }
    }
    
    if (!testStory) {
      console.log('❌ No stories with panel images found');
      console.log('   Stories may have images in GridFS but no imageFileId references');
      return;
    }
    
    console.log(`2️⃣ Testing with Story ${testStory._id}`);
    console.log(`   Type: ${testStory.type}`);
    console.log(`   Panels: ${testStory.visualNarrative?.panels?.length || 0}`);
    console.log(`   Test Panel: ${testPanel.number}`);
    console.log(`   Image ID: ${testPanel.imageFileId}\n`);
    
    // 3. Test image endpoint
    const imageId = testPanel.imageFileId;
    const imageUrl = `${API_BASE}/files/image/${imageId}`;
    
    console.log(`3️⃣ Testing image URL: ${imageUrl}`);
    
    try {
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      
      console.log(`✅ Image retrieved successfully`);
      console.log(`   Status: ${imageResponse.status}`);
      console.log(`   Content-Type: ${imageResponse.headers['content-type']}`);
      console.log(`   Size: ${(imageResponse.data.length / 1024).toFixed(2)} KB`);
      
      // Save sample image to verify
      const outputPath = path.join(__dirname, 'test-image-output.png');
      fs.writeFileSync(outputPath, imageResponse.data);
      console.log(`   💾 Saved test image to: ${outputPath}\n`);
      
      // 4. Test all panels in the story
      console.log(`4️⃣ Testing all panels in story...`);
      const panels = testStory.visualNarrative?.panels || [];
      
      for (const panel of panels) {
        if (panel.imageFileId) {
          const panelUrl = `${API_BASE}/files/image/${panel.imageFileId}`;
          try {
            const panelResponse = await axios.head(panelUrl, { timeout: 5000 });
            console.log(`   ✅ Panel ${panel.number}: ${panelResponse.status} - ${panelResponse.headers['content-type']}`);
          } catch (err) {
            console.log(`   ❌ Panel ${panel.number}: ${err.response?.status || err.message}`);
          }
        } else {
          console.log(`   ⚠️  Panel ${panel.number}: No imageFileId`);
        }
      }
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✅ IMAGE SERVING IS WORKING');
      console.log('═══════════════════════════════════════════════════════');
      console.log('If frontend shows broken images, the issue is likely:');
      console.log('1. CORS configuration');
      console.log('2. Frontend API URL mismatch');
      console.log('3. Browser console errors');
      console.log('');
      
    } catch (err) {
      console.log(`❌ Failed to retrieve image`);
      console.log(`   Error: ${err.message}`);
      
      if (err.response) {
        console.log(`   Status: ${err.response.status}`);
        console.log(`   Response: ${err.response.data?.toString() || 'No data'}`);
      }
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('❌ IMAGE SERVING ENDPOINT FAILURE');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Possible causes:');
      console.log('1. Backend server not running on correct port');
      console.log('2. Route /api/files/image/:id not registered');
      console.log('3. GridFS bucket not initialized');
      console.log('4. Image ID format mismatch');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Backend server is not running!');
      console.log('   Start it with: npm start');
    }
  }
}

testImageEndpoint();

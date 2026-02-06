const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const videoService = require('../services/videoService');
const fs = require('fs').promises;
const axios = require('axios');

async function testVideoService() {
  console.log('🧪 Testing Video Generation Service\n');
  console.log('='.repeat(50));

  // Check FFmpeg availability
  console.log('\n🔍 Checking FFmpeg...');
  await videoService.checkFFmpeg();

  if (!videoService.ffmpegAvailable) {
    console.error('\n❌ FFmpeg is not available!');
    console.log('\n💡 Installation instructions:');
    console.log('Windows: Download from https://ffmpeg.org/download.html');
    console.log('  - Extract to C:\\ffmpeg');
    console.log('  - Add C:\\ffmpeg\\bin to your PATH');
    console.log('Mac: brew install ffmpeg');
    console.log('Linux: sudo apt-get install ffmpeg');
    process.exit(1);
  }

  console.log('\n✅ FFmpeg is available!');

  // Download some sample images for testing
  console.log('\n📥 Downloading sample images for testing...');
  
  const sampleImageUrls = [
    'https://via.placeholder.com/1024x1024/FF6B6B/FFFFFF?text=Panel+1',
    'https://via.placeholder.com/1024x1024/4ECDC4/FFFFFF?text=Panel+2',
    'https://via.placeholder.com/1024x1024/45B7D1/FFFFFF?text=Panel+3'
  ];

  const imageBuffers = [];
  
  try {
    for (const url of sampleImageUrls) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      imageBuffers.push(Buffer.from(response.data));
    }
    console.log(`✅ Downloaded ${imageBuffers.length} sample images`);
  } catch (error) {
    console.error('❌ Failed to download sample images:', error.message);
    console.log('\n💡 You can skip this test if you don\'t have internet connectivity');
    console.log('The service will work fine when integrated with actual panel images');
    process.exit(1);
  }

  // Test different video styles
  const videoStyles = [
    { name: 'motion-comic', label: 'Motion Comic (Default)' },
    { name: 'slideshow', label: 'Simple Slideshow' },
    { name: 'dynamic', label: 'Dynamic/Fast-Paced' }
  ];

  for (const style of videoStyles) {
    console.log(`\n🎬 Testing style: ${style.label}`);
    console.log('⏰ This may take 30-60 seconds...');

    try {
      const videoBuffer = await videoService.generateStoryVideo(
        imageBuffers,
        null, // no audio for test
        { name: style.name },
        null  // no story metadata
      );

      console.log('✅ Video generated successfully!');
      console.log(`📦 Size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);

      // Save test video
      const outputPath = path.join(__dirname, `test-output-video-${style.name}.mp4`);
      await fs.writeFile(outputPath, videoBuffer);
      console.log(`💾 Saved to: ${outputPath}`);

      // Get duration
      const duration = await videoService.getVideoDuration(videoBuffer);
      console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);

    } catch (error) {
      console.error(`❌ Failed to generate ${style.label}:`, error.message);
      
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure FFmpeg is properly installed and in your PATH');
      console.log('2. Try running: ffmpeg -version');
      console.log('3. Check disk space for temporary files');
      console.log('4. On Windows, ensure no antivirus is blocking FFmpeg');
      
      continue; // Try next style
    }
  }

  console.log('\n✨ All tests completed!');
  console.log('\n📹 Video files have been saved to the scripts directory.');
  console.log('You can open them to preview the different animation styles.');
}

// Run test
testVideoService().catch(console.error);

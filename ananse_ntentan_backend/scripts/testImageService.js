const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const imageService = require('../services/imageService');
const fs = require('fs').promises;

async function testImageService() {
  console.log('🧪 Testing Image Generation Service\n');
  console.log('='.repeat(50));
  
  // Check configuration
  console.log('\n📋 Configuration:');
  console.log(`Provider: ${imageService.provider}`);
  console.log(`Hugging Face Token: ${imageService.huggingfaceToken ? '✅ Set' : '❌ Not set'}`);
  console.log(`Stability Token: ${imageService.stabilityToken ? '✅ Set' : '❌ Not set'}`);

  // Test panel data
  const testPanel = {
    number: 1,
    scene: 'A mysterious forest at twilight',
    description: 'Ancient trees with glowing mushrooms illuminate a winding path',
    dialogue: 'The journey begins here...'
  };

  const testVisualStyle = {
    name: 'Fantasy Epic',
    promptModifiers: [
      'fantasy art style',
      'vibrant colors',
      'magical atmosphere',
      'epic composition'
    ]
  };

  console.log('\n🎨 Test Panel:');
  console.log(JSON.stringify(testPanel, null, 2));

  console.log('\n🎭 Visual Style:');
  console.log(JSON.stringify(testVisualStyle, null, 2));

  try {
    console.log('\n🚀 Starting image generation...');
    console.log('⏰ This may take 30-60 seconds...\n');

    const imageBuffer = await imageService.generatePanelImage(testPanel, testVisualStyle);

    console.log('\n✅ Image generated successfully!');
    console.log(`📦 Size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

    // Save test image
    const outputPath = path.join(__dirname, 'test-output-image.png');
    await fs.writeFile(outputPath, imageBuffer);
    console.log(`💾 Saved to: ${outputPath}`);

    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.statusText);
      if (error.response.data) {
        console.error('Error details:', error.response.data);
      }
    }

    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure you have set the appropriate API token in .env:');
    console.log('   - HUGGINGFACE_API_TOKEN for Hugging Face (free tier available)');
    console.log('   - STABILITY_API_KEY for Stability AI');
    console.log('2. Check your IMAGE_PROVIDER setting (huggingface, stability, or imagen)');
    console.log('3. For Hugging Face, the model might be loading. Wait a minute and try again.');
    console.log('4. Check API rate limits and quotas');

    process.exit(1);
  }
}

// Run test
testImageService().catch(console.error);

#!/usr/bin/env node

/**
 * Setup script for image and video generation features
 * Run: node scripts/setup-media-features.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function checkFFmpeg() {
  console.log('\n🔍 Checking for FFmpeg...');
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    console.log('✅ FFmpeg is installed!');
    return true;
  } catch (error) {
    console.log('❌ FFmpeg is NOT installed');
    console.log('\n📦 Installation instructions:');
    console.log('Windows: https://ffmpeg.org/download.html');
    console.log('  - Download, extract to C:\\ffmpeg');
    console.log('  - Add C:\\ffmpeg\\bin to PATH');
    console.log('macOS: brew install ffmpeg');
    console.log('Linux: sudo apt-get install ffmpeg');
    return false;
  }
}

async function updateEnvFile(updates) {
  const envPath = path.join(__dirname, '../.env');
  const envExamplePath = path.join(__dirname, '../.env.example');
  
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(envExamplePath)) {
    console.log('\n📝 Creating .env file from .env.example...');
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  } else {
    envContent = '# Ananse Ntentan Environment Variables\n\n';
  }

  // Update or add each key-value pair
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      // Update existing
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new
      envContent += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated');
}

async function main() {
  console.log('🎨 Ananse Ntentan - Media Features Setup');
  console.log('='.repeat(50));

  // Check FFmpeg
  const hasFFmpeg = await checkFFmpeg();

  // Ask about image generation
  console.log('\n' + '='.repeat(50));
  console.log('IMAGE GENERATION SETUP');
  console.log('='.repeat(50));
  
  const enableImages = await question('\nEnable image generation? (y/n): ');
  
  let imageUpdates = {};
  
  if (enableImages.toLowerCase() === 'y') {
    imageUpdates.ENABLE_IMAGE_GENERATION = 'true';
    
    console.log('\nAvailable providers:');
    console.log('1. Hugging Face (FREE tier available)');
    console.log('2. Stability AI (PAID, ~$0.02/image)');
    
    const providerChoice = await question('Choose provider (1 or 2): ');
    
    if (providerChoice === '1') {
      imageUpdates.IMAGE_PROVIDER = 'huggingface';
      console.log('\n📝 You need a Hugging Face API token:');
      console.log('1. Go to https://huggingface.co/');
      console.log('2. Sign up/login');
      console.log('3. Go to Settings > Access Tokens');
      console.log('4. Create a new token');
      
      const hfToken = await question('\nEnter your Hugging Face token (or press Enter to skip): ');
      if (hfToken) {
        imageUpdates.HUGGINGFACE_API_TOKEN = hfToken;
      }
    } else if (providerChoice === '2') {
      imageUpdates.IMAGE_PROVIDER = 'stability';
      console.log('\n📝 You need a Stability AI API key:');
      console.log('1. Go to https://platform.stability.ai/');
      console.log('2. Sign up and add payment method');
      console.log('3. Go to API Keys section');
      
      const stabilityKey = await question('\nEnter your Stability AI key (or press Enter to skip): ');
      if (stabilityKey) {
        imageUpdates.STABILITY_API_KEY = stabilityKey;
      }
    }
  } else {
    imageUpdates.ENABLE_IMAGE_GENERATION = 'false';
  }

  // Ask about video generation
  console.log('\n' + '='.repeat(50));
  console.log('VIDEO GENERATION SETUP');
  console.log('='.repeat(50));
  
  if (!hasFFmpeg) {
    console.log('\n⚠️  FFmpeg is required for video generation');
    console.log('Please install FFmpeg first, then run this script again');
    imageUpdates.ENABLE_VIDEO_GENERATION = 'false';
  } else {
    const enableVideo = await question('\nEnable video generation? (y/n): ');
    
    if (enableVideo.toLowerCase() === 'y') {
      imageUpdates.ENABLE_VIDEO_GENERATION = 'true';
      
      console.log('\nAvailable video styles:');
      console.log('1. motion-comic (Default - cinematic)');
      console.log('2. slideshow (Simple)');
      console.log('3. dynamic (Fast-paced)');
      console.log('4. documentary (Slow pan)');
      
      const styleChoice = await question('\nChoose default style (1-4, or press Enter for default): ');
      const styles = ['motion-comic', 'slideshow', 'dynamic', 'documentary'];
      const styleIndex = parseInt(styleChoice) - 1;
      if (styleIndex >= 0 && styleIndex < styles.length) {
        imageUpdates.DEFAULT_VIDEO_STYLE = styles[styleIndex];
      }
    } else {
      imageUpdates.ENABLE_VIDEO_GENERATION = 'false';
    }
  }

  // Update .env file
  console.log('\n📝 Updating .env file...');
  await updateEnvFile(imageUpdates);

  // Run tests
  console.log('\n' + '='.repeat(50));
  console.log('RUNNING TESTS');
  console.log('='.repeat(50));
  
  const runTests = await question('\nRun test scripts to verify setup? (y/n): ');
  
  if (runTests.toLowerCase() === 'y') {
    if (imageUpdates.ENABLE_IMAGE_GENERATION === 'true' && 
        (imageUpdates.HUGGINGFACE_API_TOKEN || imageUpdates.STABILITY_API_KEY)) {
      console.log('\n🧪 Testing image generation...');
      try {
        execSync('node scripts/testImageService.js', { stdio: 'inherit' });
      } catch (error) {
        console.log('⚠️  Image test failed. Check your API keys.');
      }
    }
    
    if (imageUpdates.ENABLE_VIDEO_GENERATION === 'true' && hasFFmpeg) {
      console.log('\n🧪 Testing video generation...');
      try {
        execSync('node scripts/testVideoService.js', { stdio: 'inherit' });
      } catch (error) {
        console.log('⚠️  Video test failed. Check FFmpeg installation.');
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✨ SETUP COMPLETE!');
  console.log('='.repeat(50));
  console.log('\n📋 Summary:');
  console.log(`Image Generation: ${imageUpdates.ENABLE_IMAGE_GENERATION === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`Video Generation: ${imageUpdates.ENABLE_VIDEO_GENERATION === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
  
  console.log('\n📚 Next steps:');
  console.log('1. Review your .env file');
  console.log('2. Install dependencies: npm install');
  console.log('3. Start your server: npm start');
  console.log('4. Create a story and watch the magic happen! ✨');
  
  console.log('\n📖 Documentation: documentation/IMAGE_VIDEO_INTEGRATION.md');
  
  rl.close();
}

main().catch(console.error);

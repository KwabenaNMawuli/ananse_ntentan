# Image and Video Generation Integration Guide

## 🎯 Overview

This guide covers the newly integrated **image and video generation features** for the Ananse Ntentan storytelling platform. These features allow the system to automatically generate:

1. **Panel Images** - Visual representations for each story panel
2. **Animated Videos** - Motion comic-style videos from the generated panels

---

## 🎨 Image Generation

### Supported Providers

The system supports multiple image generation providers:

#### 1. **Hugging Face** (Recommended for MVP) ✅
- **Model**: Stable Diffusion XL or similar
- **Cost**: Free tier available
- **Quality**: Good for MVP
- **Setup Time**: 5 minutes

#### 2. **Stability AI**
- **Model**: Stable Diffusion XL 1.0
- **Cost**: ~$0.01-0.03 per image
- **Quality**: Professional-grade
- **Setup Time**: 10 minutes

#### 3. **Google Imagen 3** (Future)
- **Model**: Imagen 3 via Vertex AI
- **Cost**: TBD (limited availability)
- **Quality**: State-of-the-art
- **Setup Time**: Complex setup required

### Configuration

Add these to your `.env` file:

```env
# Image Generation Settings
ENABLE_IMAGE_GENERATION=true
IMAGE_PROVIDER=huggingface  # Options: huggingface, stability, imagen

# Hugging Face (Free tier available)
HUGGINGFACE_API_TOKEN=hf_your_token_here
HF_IMAGE_MODEL=stabilityai/stable-diffusion-xl-base-1.0

# Stability AI (Paid)
STABILITY_API_KEY=sk-your-key-here
STABILITY_ENGINE=stable-diffusion-xl-1024-v1-0
```

### Getting API Keys

#### Hugging Face (FREE)
1. Go to https://huggingface.co/
2. Sign up/login
3. Go to Settings > Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token (starts with `hf_`)

#### Stability AI (PAID)
1. Go to https://platform.stability.ai/
2. Sign up and add payment method
3. Go to API Keys section
4. Generate new API key
5. Copy the key

### Testing Image Generation

```bash
cd ananse_ntentan_backend

# Install dependencies first
npm install

# Test the image service
node scripts/testImageService.js
```

Expected output:
```
🧪 Testing Image Generation Service
==================================================

📋 Configuration:
Provider: huggingface
Hugging Face Token: ✅ Set

🎨 Test Panel:
{
  "number": 1,
  "scene": "A mysterious forest at twilight",
  "description": "Ancient trees with glowing mushrooms...",
  "dialogue": "The journey begins here..."
}

🚀 Starting image generation...
⏰ This may take 30-60 seconds...

✅ Image generated successfully!
📦 Size: 234.56 KB
💾 Saved to: test-output-image.png
```

---

## 🎬 Video Generation

### Requirements

The video generation feature requires **FFmpeg** to be installed on your system.

### Installing FFmpeg

#### Windows
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your PATH environment variable
4. Restart your terminal/VS Code
5. Verify: `ffmpeg -version`

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Configuration

Add to your `.env` file:

```env
# Video Generation Settings
ENABLE_VIDEO_GENERATION=true
```

### Video Styles

The system supports multiple animation styles:

1. **Motion Comic** (Default)
   - Subtle zoom effects
   - Cinematic feel
   - Duration: 5 seconds per panel

2. **Animated Storyboard**
   - Fast-paced action
   - Quick transitions
   - Duration: 3 seconds per panel

3. **Slideshow**
   - Simple, clean transitions
   - No zoom effects
   - Duration: 4 seconds per panel

4. **Documentary**
   - Slow, professional pan
   - Fade transitions
   - Duration: 6 seconds per panel

5. **Dynamic**
   - Fast cuts
   - Heavy zoom
   - Duration: 2.5 seconds per panel

### Testing Video Generation

```bash
# Test the video service
node scripts/testVideoService.js
```

Expected output:
```
🧪 Testing Video Generation Service
==================================================

🔍 Checking FFmpeg...
✅ FFmpeg is available!

📥 Downloading sample images for testing...
✅ Downloaded 3 sample images

🎬 Testing style: Motion Comic (Default)
⏰ This may take 30-60 seconds...
✅ Video generated successfully!
📦 Size: 1.23 MB
💾 Saved to: test-output-video-motion-comic.mp4
⏱️  Duration: 15.00 seconds
```

---

## 🔧 Integration with Story Processing

The image and video generation is automatically integrated into the story processing pipeline:

### Processing Flow

```
User submits story
    ↓
Generate story narrative (Gemini)
    ↓
Generate panel images (if ENABLE_IMAGE_GENERATION=true)
    ↓
Upload images to GridFS
    ↓
Generate animated video (if ENABLE_VIDEO_GENERATION=true)
    ↓
Upload video to GridFS
    ↓
Update story record
    ↓
Story complete!
```

### Code Integration

The storyController now includes:

```javascript
// 8. Generate images for panels
const enableImageGeneration = process.env.ENABLE_IMAGE_GENERATION === 'true';
if (enableImageGeneration) {
  const imageBuffers = await imageService.generateAllPanelImages(
    storyData.panels,
    visualStyle
  );
  // Upload to GridFS and update panels
}

// 9. Generate video from panels
const enableVideoGeneration = process.env.ENABLE_VIDEO_GENERATION === 'true';
if (enableVideoGeneration) {
  const videoBuffer = await videoService.generateStoryVideo(
    imageBuffers,
    audioBuffer,  // optional
    videoStyle,
    storyData
  );
  // Upload to GridFS
}
```

### Story Model Updates

The Story model now includes:

```javascript
visualNarrative: {
  panels: [{
    number: Number,
    description: String,
    dialogue: String,
    scene: String,
    imageFileId: ObjectId  // NEW: Reference to generated image
  }],
  style: String,
  videoFileId: ObjectId,   // NEW: Reference to generated video
  videoDuration: Number    // NEW: Duration in seconds
}
```

---

## 💰 Cost Estimates

### Image Generation Costs

**Hugging Face (FREE Tier)**
- Cost: $0 per image (rate limits apply)
- 3 panels per story: $0
- 1000 stories/month: $0

**Stability AI**
- Cost: ~$0.02 per image
- 3 panels per story: $0.06
- 1000 stories/month: $60

### Video Generation Costs

**FFmpeg (Self-hosted)**
- Cost: $0 (uses server compute)
- Processing time: 20-40 seconds per video
- Server cost depends on your hosting

### Total Cost Per Story

**MVP Configuration (Recommended)**
- Gemini: $0 (hackathon credits)
- Images (Hugging Face): $0
- Video (FFmpeg): $0
- **Total: $0** 🎉

**Premium Configuration**
- Gemini: $0.0025
- Images (Stability AI): $0.06
- Video (FFmpeg): $0
- Audio (Google TTS): $0.01
- **Total: $0.0725 per story**

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ananse_ntentan_backend
npm install
```

### 2. Configure Environment

Add to `.env`:

```env
# Image Generation (Choose one provider)
ENABLE_IMAGE_GENERATION=true
IMAGE_PROVIDER=huggingface
HUGGINGFACE_API_TOKEN=your_token_here

# Video Generation
ENABLE_VIDEO_GENERATION=true
```

### 3. Install FFmpeg

Follow platform-specific instructions above.

### 4. Test Services

```bash
# Test image generation
node scripts/testImageService.js

# Test video generation
node scripts/testVideoService.js
```

### 5. Create a Story

Use your existing API endpoints:

```bash
POST /api/stories/write
{
  "text": "A brave spider ventures into the digital realm...",
  "visualStyleId": "style_id_here",
  "audioStyleId": "audio_style_id_here"
}
```

The response will include:
- Story with generated panels
- Image file IDs for each panel
- Video file ID for the animated video

---

## 📊 Performance Considerations

### Image Generation
- Time: 5-10 seconds per panel with Hugging Face
- Time: 2-5 seconds per panel with Stability AI
- Sequential processing (to respect rate limits)
- For 3 panels: 15-30 seconds total

### Video Generation
- Time: 20-40 seconds for 3-panel video
- Depends on server CPU
- More panels = longer processing time

### Recommendations

For best user experience:

1. **Enable async processing** (already implemented)
   - Return story ID immediately
   - Process in background
   - Poll for status

2. **Start with images disabled** for testing
   - Test the story generation pipeline first
   - Enable images once you have API keys

3. **Enable video for premium users** only
   - Video generation is CPU-intensive
   - Consider offering as a premium feature

---

## 🐛 Troubleshooting

### Image Generation Issues

**"HUGGINGFACE_API_TOKEN not configured"**
- Make sure you've added the token to `.env`
- Restart your server after updating `.env`

**"Model is loading"**
- Hugging Face models need to warm up (first use)
- Wait 1-2 minutes and try again
- This only happens on the first request

**Rate limit errors**
- Free tier has limits
- Upgrade to Pro or use Stability AI
- Add delays between requests

### Video Generation Issues

**"FFmpeg not found"**
- Install FFmpeg following the instructions above
- Make sure it's in your PATH
- Restart terminal/VS Code after installation

**"Video generation failed"**
- Check FFmpeg installation: `ffmpeg -version`
- Check disk space for temporary files
- Review FFmpeg logs in console

**Slow video generation**
- Normal for first time (codec loading)
- Depends on server CPU
- Consider using lower resolution for faster processing

---

## 🔮 Future Enhancements

### Phase 2 Features
1. **Custom video styles** per user preference
2. **Audio narration sync** with video
3. **Multiple aspect ratios** (square, portrait, landscape)
4. **Video transitions** with effects library
5. **Parallel image generation** with rate limiting

### Phase 3 Features
1. **Google Imagen 3 integration** (when available)
2. **Advanced video effects** (parallax, 3D depth)
3. **Custom music** generation with AI
4. **Real-time preview** of generation progress
5. **Video editing** capabilities

---

## 📚 Additional Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference/index)
- [Stability AI Documentation](https://platform.stability.ai/docs)
- [Ken Burns Effect](https://en.wikipedia.org/wiki/Ken_Burns_effect)

---

## ✅ Checklist

Before going to production:

- [ ] Install FFmpeg on server
- [ ] Get and configure image generation API key
- [ ] Test image generation with various styles
- [ ] Test video generation with different panel counts
- [ ] Set appropriate rate limits
- [ ] Monitor API costs
- [ ] Set up error handling and fallbacks
- [ ] Add frontend UI for viewing images/videos
- [ ] Implement video player in Feed component
- [ ] Add download options for users
- [ ] Set up CDN for video delivery (optional)

---

**Questions?** Check the test scripts or review the service implementations in:
- `services/imageService.js`
- `services/videoService.js`
- `controllers/storyController.js`

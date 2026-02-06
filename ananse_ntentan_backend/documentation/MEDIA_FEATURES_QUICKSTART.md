# 🎨 Image & Video Generation - Quick Start

This guide helps you quickly enable image and video generation for your Ananse Ntentan stories.

## 🚀 Quick Setup (5 minutes)

### Option 1: Automated Setup (Recommended)

```bash
cd ananse_ntentan_backend
node scripts/setup-media-features.js
```

This interactive script will:
- Check for FFmpeg
- Help you configure image generation
- Help you configure video generation
- Update your .env file
- Run test scripts

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get API Keys** (for image generation)
   
   **Hugging Face (FREE):**
   - Visit https://huggingface.co/settings/tokens
   - Create a new token
   - Add to `.env`: `HUGGINGFACE_API_TOKEN=hf_your_token`

3. **Install FFmpeg** (for video generation)
   
   **Windows:**
   - Download from https://ffmpeg.org/download.html
   - Extract to `C:\ffmpeg`
   - Add `C:\ffmpeg\bin` to PATH
   
   **Mac:**
   ```bash
   brew install ffmpeg
   ```
   
   **Linux:**
   ```bash
   sudo apt-get install ffmpeg
   ```

4. **Configure .env**
   ```env
   # Enable features
   ENABLE_IMAGE_GENERATION=true
   ENABLE_VIDEO_GENERATION=true
   
   # Image settings
   IMAGE_PROVIDER=huggingface
   HUGGINGFACE_API_TOKEN=your_token_here
   
   # Video settings (FFmpeg required)
   DEFAULT_VIDEO_STYLE=motion-comic
   ```

5. **Test Setup**
   ```bash
   # Test image generation
   node scripts/testImageService.js
   
   # Test video generation
   node scripts/testVideoService.js
   ```

## 📖 How It Works

When you create a story via the API:

```bash
POST /api/stories/write
{
  "text": "A brave spider ventures into the digital realm...",
  "visualStyleId": "style_id_here"
}
```

The system will:

1. ✅ Generate story narrative (Gemini)
2. ✅ Create panel descriptions
3. 🎨 Generate images for each panel (if enabled)
4. 🎬 Create animated video from panels (if enabled)
5. 💾 Store everything in database

## 🎨 Image Generation

### Providers

| Provider | Cost | Quality | Setup |
|----------|------|---------|-------|
| Hugging Face | FREE* | Good | Easy |
| Stability AI | $0.02/image | Excellent | Easy |
| Google Imagen | TBD | Best | Complex |

*Free tier has rate limits

### Example Output

For a 3-panel story:
- 3 PNG images (1024x1024)
- Processing time: 15-30 seconds
- Cost: $0 (Hugging Face) or $0.06 (Stability AI)

## 🎬 Video Generation

### Styles

- **Motion Comic** - Cinematic zoom effects, 5s per panel
- **Slideshow** - Simple transitions, 4s per panel
- **Dynamic** - Fast-paced action, 2.5s per panel
- **Documentary** - Professional pan, 6s per panel

### Example Output

For a 3-panel story:
- MP4 video (1920x1080)
- Duration: 12-18 seconds
- Processing time: 20-40 seconds
- Cost: $0 (self-hosted FFmpeg)

## 💰 Cost Calculator

| Configuration | Cost per Story | 1000 Stories/Month |
|---------------|----------------|---------------------|
| MVP (HF + FFmpeg) | $0 | $0 |
| Premium (Stability + FFmpeg) | $0.06 | $60 |
| Ultra (Stability + Audio) | $0.07 | $70 |

## 🐛 Troubleshooting

### "FFmpeg not found"
```bash
# Check installation
ffmpeg -version

# Windows: Add to PATH
setx PATH "%PATH%;C:\ffmpeg\bin"

# Restart terminal/VS Code
```

### "HUGGINGFACE_API_TOKEN not configured"
```bash
# Add to .env file
HUGGINGFACE_API_TOKEN=hf_your_token_here

# Restart server
npm start
```

### "Model is loading" (Hugging Face)
- First request takes 1-2 minutes to warm up
- Wait and try again
- Normal behavior for free tier

### Slow video generation
- First video takes longer (codec loading)
- Depends on CPU speed
- Normal: 20-40 seconds per video

## 📊 API Response

With images and video enabled, the story response includes:

```json
{
  "success": true,
  "story": {
    "_id": "story_id",
    "visualNarrative": {
      "panels": [
        {
          "number": 1,
          "description": "...",
          "imageFileId": "file_id_1"  // NEW
        }
      ],
      "videoFileId": "video_file_id",  // NEW
      "videoDuration": 15.5           // NEW
    }
  }
}
```

## 🎯 Performance Tips

1. **Start with images disabled** during development
2. **Enable images** when you have API keys
3. **Enable video** only when ready (CPU intensive)
4. **Use async processing** (already implemented)
5. **Monitor API costs** regularly

## 📚 Full Documentation

See [IMAGE_VIDEO_INTEGRATION.md](./IMAGE_VIDEO_INTEGRATION.md) for complete details.

## ✅ Pre-Production Checklist

- [ ] FFmpeg installed on production server
- [ ] Image API keys configured
- [ ] Test image generation with all styles
- [ ] Test video generation with different panel counts
- [ ] Set up error monitoring
- [ ] Configure rate limits
- [ ] Monitor API costs
- [ ] Add frontend video player
- [ ] Test with real user stories

## 🆘 Need Help?

1. Check logs in console output
2. Run test scripts: `node scripts/testImageService.js`
3. Review documentation: `documentation/IMAGE_VIDEO_INTEGRATION.md`
4. Check `.env` configuration
5. Verify API keys are valid

---

**Ready to create amazing visual stories!** 🎨✨

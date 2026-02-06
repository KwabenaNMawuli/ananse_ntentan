# 🎨🎬 Image & Video Generation Features - Complete Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [What's New](#whats-new)
3. [Quick Start](#quick-start)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [API Usage](#api-usage)
8. [Cost Analysis](#cost-analysis)
9. [Troubleshooting](#troubleshooting)
10. [Documentation](#documentation)

---

## 🎯 Overview

Your Ananse Ntentan platform now includes **automatic image and video generation** for story panels! When users create stories, the system can:

- 🎨 **Generate images** for each story panel using AI
- 🎬 **Create animated videos** from panels with cinematic effects
- 💾 **Store media** in GridFS for seamless retrieval
- 📱 **Deliver content** ready for display in your frontend

---

## 🆕 What's New

### New Services

| Service | File | Purpose |
|---------|------|---------|
| Image Generation | `services/imageService.js` | Generate panel images using AI |
| Video Generation | `services/videoService.js` | Create animated videos with FFmpeg |

### New Features

- ✅ Multiple image providers (Hugging Face, Stability AI, Google Imagen)
- ✅ Multiple video styles (Motion Comic, Slideshow, Dynamic, etc.)
- ✅ Automatic media storage in GridFS
- ✅ Feature flags for easy enable/disable
- ✅ Comprehensive error handling and fallbacks
- ✅ Background processing (non-blocking)

### Updated Components

- ✅ Story model with image/video references
- ✅ Story controller with media generation pipeline
- ✅ Environment configuration
- ✅ Package dependencies

---

## 🚀 Quick Start

### 1️⃣ Install Dependencies

```bash
# Windows
cd ananse_ntentan_backend
npm install

# Or use the install script
scripts\install-media-deps.bat

# Mac/Linux
./scripts/install-media-deps.sh
```

### 2️⃣ Run Setup Wizard

```bash
npm run setup:media
```

This interactive script will:
- Check FFmpeg installation
- Help configure image generation
- Help configure video generation
- Update your .env file
- Run validation tests

### 3️⃣ Test Features

```bash
# Test image generation
npm run test:image

# Test video generation
npm run test:video
```

### 4️⃣ Start Server

```bash
npm start
# or
npm run dev
```

---

## 📦 Installation

### Prerequisites

1. **Node.js** (v16+ recommended)
2. **MongoDB** (running)
3. **FFmpeg** (for video generation)

### Installing FFmpeg

#### Windows
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH:
   - System Properties → Environment Variables
   - Edit "Path" → New → `C:\ffmpeg\bin`
   - Click OK, restart terminal

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

#### Verify Installation
```bash
ffmpeg -version
```

### Install Node Dependencies

```bash
cd ananse_ntentan_backend
npm install
```

New packages installed:
- `axios` - HTTP client for API requests
- `fluent-ffmpeg` - FFmpeg wrapper for video processing
- `sharp` - Image optimization (optional)

---

## ⚙️ Configuration

### Get API Keys

#### Hugging Face (FREE - Recommended for MVP)

1. Go to https://huggingface.co/
2. Sign up/login
3. Navigate to Settings → Access Tokens
4. Create new token with "Read" permissions
5. Copy token (starts with `hf_`)

#### Stability AI (PAID - Premium Quality)

1. Go to https://platform.stability.ai/
2. Sign up and add payment method
3. Navigate to API Keys
4. Generate new key
5. Copy key (starts with `sk-`)

### Configure .env File

Add these to your `.env` file:

```env
# ==========================================
# IMAGE GENERATION
# ==========================================

# Enable image generation
ENABLE_IMAGE_GENERATION=true

# Choose provider: huggingface, stability, or imagen
IMAGE_PROVIDER=huggingface

# Hugging Face Settings (FREE)
HUGGINGFACE_API_TOKEN=hf_your_token_here
HF_IMAGE_MODEL=stabilityai/stable-diffusion-xl-base-1.0

# Stability AI Settings (PAID)
STABILITY_API_KEY=sk-your_key_here
STABILITY_ENGINE=stable-diffusion-xl-1024-v1-0

# ==========================================
# VIDEO GENERATION
# ==========================================

# Enable video generation (requires FFmpeg)
ENABLE_VIDEO_GENERATION=true

# Default style: motion-comic, slideshow, dynamic, documentary
DEFAULT_VIDEO_STYLE=motion-comic
```

### Configuration Options

| Variable | Options | Default | Notes |
|----------|---------|---------|-------|
| `ENABLE_IMAGE_GENERATION` | true/false | false | Master switch |
| `IMAGE_PROVIDER` | huggingface, stability, imagen | huggingface | Choose provider |
| `ENABLE_VIDEO_GENERATION` | true/false | false | Requires FFmpeg |
| `DEFAULT_VIDEO_STYLE` | See styles below | motion-comic | Animation style |

### Video Styles

| Style | Description | Duration/Panel | Use Case |
|-------|-------------|----------------|----------|
| `motion-comic` | Cinematic zoom, smooth | 5 seconds | Default, professional |
| `slideshow` | Simple transitions | 4 seconds | Clean, minimal |
| `dynamic` | Fast-paced action | 2.5 seconds | Action stories |
| `documentary` | Slow professional pan | 6 seconds | Narrative focus |
| `animated-storyboard` | Quick cuts | 3 seconds | Modern, energetic |

---

## 🧪 Testing

### Test Image Generation

```bash
npm run test:image
```

**Expected Output:**
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
💾 Saved to: scripts/test-output-image.png
```

### Test Video Generation

```bash
npm run test:video
```

**Expected Output:**
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
💾 Saved to: scripts/test-output-video-motion-comic.mp4
⏱️  Duration: 15.00 seconds
```

---

## 🔌 API Usage

### Create Story with Media

Use the existing endpoint - media generation is automatic:

```bash
POST http://localhost:5000/api/stories/write
Content-Type: application/json

{
  "text": "A brave spider named Anansi ventured into the digital realm, where data flowed like rivers and code formed the trees. Along the way, she met a wise firewall guardian who taught her the ancient ways of encryption.",
  "visualStyleId": "65f1234567890abc",
  "audioStyleId": "65f1234567890def"
}
```

### Response Structure

```json
{
  "success": true,
  "storyId": "65f1234567890xyz",
  "status": "pending",
  "message": "Story is being processed"
}
```

### Check Processing Status

```bash
GET http://localhost:5000/api/stories/65f1234567890xyz/status
```

**Response:**
```json
{
  "success": true,
  "status": "complete",
  "type": "write",
  "processingTime": 45230
}
```

### Get Complete Story

```bash
GET http://localhost:5000/api/stories/65f1234567890xyz
```

**Response (with media):**
```json
{
  "success": true,
  "story": {
    "_id": "65f1234567890xyz",
    "type": "write",
    "visualNarrative": {
      "panels": [
        {
          "number": 1,
          "description": "Anansi stands at the edge...",
          "scene": "Digital forest entrance",
          "dialogue": "A new world awaits...",
          "imageFileId": "65f123...abc"  // ← Generated image
        },
        {
          "number": 2,
          "description": "She encounters the firewall...",
          "scene": "Glowing digital barrier",
          "dialogue": "Who seeks passage?",
          "imageFileId": "65f123...def"  // ← Generated image
        }
      ],
      "videoFileId": "65f123...xyz",      // ← Generated video
      "videoDuration": 15.5,
      "style": "Cyberpunk Neon"
    },
    "status": "complete"
  }
}
```

### Access Media Files

```bash
# Get panel image
GET http://localhost:5000/api/files/65f123...abc

# Get video
GET http://localhost:5000/api/files/65f123...xyz
```

---

## 💰 Cost Analysis

### Free Configuration (MVP)

| Component | Provider | Cost/Story | 1000 Stories |
|-----------|----------|------------|--------------|
| Text Generation | Gemini (Hackathon) | $0 | $0 |
| Images (3 panels) | Hugging Face | $0 | $0 |
| Video | FFmpeg (Self-hosted) | $0 | $0 |
| **TOTAL** | | **$0** | **$0** |

### Premium Configuration

| Component | Provider | Cost/Story | 1000 Stories |
|-----------|----------|------------|--------------|
| Text Generation | Gemini | $0.0025 | $2.50 |
| Images (3 panels) | Stability AI | $0.06 | $60 |
| Video | FFmpeg | $0 | $0 |
| Audio | Google TTS | $0.01 | $10 |
| **TOTAL** | | **$0.0725** | **$72.50** |

### Processing Time

| Operation | Time | Notes |
|-----------|------|-------|
| Story Generation | 2-5s | Gemini API |
| Image Generation (3 panels) | 15-30s | Sequential |
| Video Generation | 20-40s | CPU dependent |
| **TOTAL** | **40-75s** | Background process |

---

## 🐛 Troubleshooting

### Common Issues

#### "FFmpeg not found"

**Problem:** Video generation fails because FFmpeg isn't installed.

**Solution:**
```bash
# Check installation
ffmpeg -version

# Windows: Add to PATH
setx PATH "%PATH%;C:\ffmpeg\bin"

# Restart terminal/VS Code
```

#### "HUGGINGFACE_API_TOKEN not configured"

**Problem:** Image generation fails due to missing API key.

**Solution:**
1. Get token from https://huggingface.co/settings/tokens
2. Add to `.env`: `HUGGINGFACE_API_TOKEN=hf_your_token`
3. Restart server

#### "Model is loading" (Hugging Face)

**Problem:** First image request takes 1-2 minutes.

**Solution:**
- This is normal for free tier
- Model needs to "warm up" on first use
- Wait and try again
- Subsequent requests are faster

#### Slow Video Generation

**Problem:** Video takes a long time to generate.

**Solution:**
- First video is slower (codec loading)
- Depends on CPU speed
- 20-40 seconds is normal
- Consider limiting to premium users

#### Images Generated but not Visible in Frontend

**Problem:** Images exist but don't display.

**Solution:**
1. Check file route: `GET /api/files/:fileId`
2. Verify GridFS connection
3. Check image file IDs in story response
4. Test direct file access in browser

---

## 📚 Documentation

### Quick References

- **[Quick Start Guide](./MEDIA_FEATURES_QUICKSTART.md)** - 5-minute setup
- **[Integration Guide](./IMAGE_VIDEO_INTEGRATION.md)** - Complete technical details
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - What was built

### Code References

| File | Purpose |
|------|---------|
| `services/imageService.js` | Image generation logic |
| `services/videoService.js` | Video generation logic |
| `controllers/storyController.js` | Integration point |
| `models/Story.js` | Database schema |
| `scripts/testImageService.js` | Image testing |
| `scripts/testVideoService.js` | Video testing |
| `scripts/setup-media-features.js` | Interactive setup |

### NPM Scripts

```bash
# Setup and configuration
npm run setup:media          # Interactive setup wizard

# Testing
npm run test:image          # Test image generation
npm run test:video          # Test video generation

# Development
npm start                   # Start production server
npm run dev                 # Start with nodemon
```

---

## ✅ Pre-Production Checklist

### Backend Setup
- [ ] FFmpeg installed on server
- [ ] Image API keys configured
- [ ] Test all image providers
- [ ] Test all video styles
- [ ] Verify GridFS storage
- [ ] Set up error monitoring
- [ ] Configure rate limits
- [ ] Monitor API costs

### Frontend Integration
- [ ] Display panel images in Feed
- [ ] Add video player component
- [ ] Implement download buttons
- [ ] Add loading indicators
- [ ] Handle missing media gracefully
- [ ] Test on mobile devices

### Performance
- [ ] Monitor processing times
- [ ] Track success rates
- [ ] Set up cost alerts
- [ ] Optimize video rendering
- [ ] Consider CDN for media delivery

---

## 🎉 Success!

When everything is working, you'll see:

1. ✅ Test scripts pass successfully
2. ✅ Stories include `imageFileId` for each panel
3. ✅ Stories include `videoFileId` for complete video
4. ✅ Media files accessible via API
5. ✅ Processing completes in under 60 seconds
6. ✅ No errors in server logs

---

## 🆘 Need Help?

1. **Check logs** - All errors logged to console
2. **Run tests** - `npm run test:image` and `npm run test:video`
3. **Review docs** - Comprehensive guides available
4. **Verify .env** - Double-check all variables
5. **Test dependencies** - `ffmpeg -version` and `node -v`

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Parallel image generation with smart rate limiting
- [ ] Custom video styles per story
- [ ] Audio narration sync with video
- [ ] Multiple aspect ratios (square, portrait, landscape)
- [ ] Real-time progress tracking

### Phase 3
- [ ] Google Imagen 3 integration
- [ ] Advanced video effects (parallax, 3D depth)
- [ ] AI music generation
- [ ] Video editing capabilities
- [ ] Social media optimized exports

---

**🎨 Ready to create amazing visual stories!** 

Start with: `npm run setup:media`

For questions, check the documentation or review the test scripts! ✨

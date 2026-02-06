# Ananse Ntentan Backend - Build Guide

## 🚀 Quick Start (Get Running in 30 Minutes)

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Gemini API key (free tier available)
- Hugging Face account (free - for Coqui TTS)

---

## Step 1: Install Dependencies (5 mins)

```bash
cd ananse_ntentan_backend
npm install
```

### Required Packages
```bash
npm install express@5.2.1 mongoose@9.1.4 dotenv@17.2.3 cors multer@1.4.5-lts.1 @google/generative-ai @langchain/google-genai @huggingface/inference helmet express-mongo-sanitize express-rate-limit express-validator morgan winston
```

### Dev Dependencies
```bash
npm install --save-dev nodemon@3.1.11
```

---

## Step 2: Environment Configuration (5 mins)

Create `.env` file in `ananse_ntentan_backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas Free Tier
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ananse_ntentan?retryWrites=true&w=majority

# Gemini API Free Tier (Use Flash for more requests)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash-latest
GEMINI_FLASH_MODEL=gemini-1.5-flash-latest
GEMINI_PRO_MODEL=gemini-1.5-pro-latest

# Hugging Face / Coqui TTS (Open-source, free)
HUGGINGFACE_API_KEY=your_huggingface_token
TTS_MODEL=coqui/XTTS-v2
TTS_ENGINE=huggingface
DEFAULT_SPEAKING_RATE=1.0

# Frontend
FRONTEND_URL=http://localhost:3000

# File Limits (optimized for free tier)
MAX_FILE_SIZE_AUDIO=5242880
MAX_FILE_SIZE_IMAGE=2097152

# Rate Limiting (respect free tier limits)
RATE_LIMIT_MAX_REQUESTS=50
GEMINI_MAX_REQUESTS_PER_DAY=1000
```

### Setup Instructions:

**MongoDB Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and M0 cluster
3. Get connection string and replace in MONGODB_URI

**Gemini API:**
1. Go to https://ai.google.dev/
2. Get free API key
3. Free tier: Flash (1,500 req/day), Pro (50 req/day)

**Hugging Face:**
1. Go to https://huggingface.co/join
2. Create free account
3. Get token from https://huggingface.co/settings/tokens
4. Unlimited free usage (rate limits may apply during high traffic)

---

## Step 3: Project Structure (5 mins)

Create the following directories:

```
ananse_ntentan_backend/
├── config/
│   └── database.js
├── models/
│   ├── Story.js
│   ├── PromptTemplate.js
│   ├── ArtisticStyle.js
│   └── AudioStyle.js
├── services/
│   ├── geminiService.js
│   ├── audioService.js
│   └── fileService.js
├── controllers/
│   ├── storyController.js
│   └── feedController.js
├── routes/
│   ├── stories.js
│   ├── feed.js
│   └── styles.js
├── middleware/
│   ├── errorHandler.js
│   ├── upload.js
│   └── rateLimiter.js
├── scripts/
│   ├── seedStyles.js
│   └── seedPrompts.js
├── utils/
│   └── logger.js
├── .env
├── server.js
└── package.json
```

---

## Step 4: Core Files (15 mins)

### A. `server.js` - Entry Point

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

// Routes
app.use('/api/stories', require('./routes/stories'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/styles', require('./routes/styles'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### B. `config/database.js` - MongoDB Connection

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### C. `middleware/errorHandler.js`

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

---

## Step 5: Database Models (Models to Create First)

### Priority 1: `models/Story.js`

```javascript
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['speak', 'write', 'sketch'],
    required: true
  },
  originalContent: {
    text: String,
    audioFileId: mongoose.Schema.Types.ObjectId,
    imageFileId: mongoose.Schema.Types.ObjectId,
    transcription: String
  },
  visualNarrative: {
    panels: [{
      number: Number,
      description: String,
      dialogue: String,
      scene: String
    }],
    style: String
  },
  audioNarrative: {
    script: String,
    audioFileId: mongoose.Schema.Types.ObjectId,
    duration: Number,
    style: String
  },
  visualStyleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtisticStyle'
  },
  audioStyleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AudioStyle'
  },
  promptTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromptTemplate'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'complete', 'failed'],
    default: 'pending'
  },
  processingTime: Number,
  errorMessage: String,
  metadata: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
storySchema.index({ createdAt: -1 });
storySchema.index({ status: 1 });
storySchema.index({ type: 1 });

module.exports = mongoose.model('Story', storySchema);
```

### Priority 2: `models/ArtisticStyle.js`

```javascript
const mongoose = require('mongoose');

const artisticStyleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  characteristics: {
    colorPalette: [String],
    lighting: String,
    mood: String,
    artisticInfluence: String
  },
  promptModifiers: [String],
  examplePanels: [String],
  popularity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArtisticStyle', artisticStyleSchema);
```

### Priority 3: `models/AudioStyle.js`

```javascript
const mongoose = require('mongoose');

const audioStyleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  voiceSettings: {
    voiceType: String, // Coqui TTS model name (e.g., 'coqui/XTTS-v2')
    speakingRate: { type: Number, default: 1.0 },
    pitch: { type: Number, default: 0.0 },
    volumeGain: { type: Number, default: 0.0 }
  },
  audioEffects: {
    backgroundMusic: String,
    ambientSounds: [String],
    processing: [String]
  },
  mood: String,
  exampleAudio: String,
  popularity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('AudioStyle', audioStyleSchema);
```

### Priority 4: `models/PromptTemplate.js`

```javascript
const mongoose = require('mongoose');

const promptTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['speak', 'write', 'sketch'],
    required: true
  },
  promptText: { type: String, required: true },
  guidelines: [String],
  styleParameters: {
    panelStructure: String,
    dialogueFormatting: String
  },
  version: { type: String, default: '1.0' },
  isActive: { type: Boolean, default: true },
  metrics: {
    successRate: Number,
    avgGenerationTime: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PromptTemplate', promptTemplateSchema);
```

---

## Step 6: Core Services

### `services/geminiService.js`

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL 
    });
  }

  async generateStory(userContent, promptTemplate, visualStyle) {
    try {
      // Assemble prompt with style modifiers
      const fullPrompt = this.assemblePrompt(
        userContent, 
        promptTemplate, 
        visualStyle
      );

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioBuffer) {
    try {
      // Gemini multimodal: native audio support
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: 'audio/mp3',
            data: audioBuffer.toString('base64')
          }
        },
        { text: 'Transcribe this audio accurately:' }
      ]);
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw error;
    }
  }

  async analyzeImage(imageBuffer) {
    try {
      // Gemini multimodal: native vision support
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBuffer.toString('base64')
          }
        },
        { text: 'Describe this image in detail for story generation:' }
      ]);
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  assemblePrompt(userContent, template, visualStyle) {
    let prompt = template.promptText;
    
    // Inject user content
    prompt += `\n\nUser Story: ${userContent}`;
    
    // Inject visual style modifiers
    if (visualStyle && visualStyle.promptModifiers) {
      prompt += `\n\nVisual Style Guidelines: ${visualStyle.promptModifiers.join(', ')}`;
    }
    
    return prompt;
  }
}

module.exports = new GeminiService();
```

### `services/audioService.js`

```javascript
const { HfInference } = require('@huggingface/inference');

class AudioService {
  constructor() {
    this.client = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  async generateAudio(script, audioStyle) {
    try {
      const model = process.env.TTS_MODEL || 'coqui/XTTS-v2';
      const response = await this.client.textToSpeech({
        model: model,
        inputs: script
      });
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Audio generation error:', error);
      throw error;
    }
  }

  async getDuration(audioBuffer) {
    // Simple estimate: MP3 at 128kbps ≈ 16KB per second
    const sizeInKB = audioBuffer.length / 1024;
    const estimatedDuration = Math.ceil((sizeInKB / 16) * 1000); // ms
    return estimatedDuration;
  }
}

module.exports = new AudioService();
```

---

## Step 7: Test Basic Server

```bash
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

Test health endpoint:
```bash
curl http://localhost:5000/health
```

---

## Next Implementation Steps

1. **Implement `fileService.js`** - GridFS file operations
2. **Create seed scripts** - Populate initial styles and prompts
3. **Implement first route** - `POST /api/stories/write`
4. **Test end-to-end** - Text → Gemini → Audio → Storage
5. **Add file upload** - Implement SPEAK and SKETCH routes
6. **Build feed API** - Retrieve and display stories
7. **Add file streaming** - Audio/image delivery

---

## Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed:styles": "node scripts/seedStyles.js",
    "seed:prompts": "node scripts/seedPrompts.js",
    "seed": "npm run seed:styles && npm run seed:prompts"
  }
}
```

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] MongoDB Atlas connection successful
- [ ] Health endpoint responds
- [ ] Environment variables loaded
- [ ] Gemini API key valid (test with Flash model)
- [ ] Hugging Face API token configured
- [ ] Coqui TTS model accessible
- [ ] Models defined correctly
- [ ] GridFS connection ready

## Free Tier Limits Summary

**MongoDB Atlas (M0):**
- 512MB storage
- Shared CPU/RAM
- Perfect for development

**Gemini Flash:**
- 15 requests/minute
- 1,500 requests/day
- Use as primary model

**Hugging Face / Coqui TTS:**
- Unlimited free API calls
- May have rate limits during high traffic
- Multiple voice models available
- Open-source and free forever

---

**You're now ready to start building! Begin with Step 1 and work through sequentially.**

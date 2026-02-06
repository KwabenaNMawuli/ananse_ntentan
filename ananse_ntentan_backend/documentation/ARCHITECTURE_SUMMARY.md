# Ananse Ntentan Backend - Architecture Summary

## 🎯 Core Concept
**An AI-powered story-sharing platform where anyone can transform their stories (speak/write/sketch) into multi-modal narratives with customizable visual, audio, and video styles, all shared in a communal feed.**

---

## ✅ What We're Building

### User Journey
1. User visits homepage
2. Chooses submission type: **SPEAK** (audio) | **WRITE** (text) | **SKETCH** (image)
3. **NEW**: Selects creative style profile:
   - 🎨 **Visual Style** - How the comic looks (Cyberpunk, Noir, Manga, etc.)
   - 🎵 **Audio Style** - How the narration sounds (Cinematic, Lo-Fi, Synthwave, etc.)
   - 🎬 **Video Style** - How animations play (Motion Comic, Fast-Cut, etc.) [Future]
4. Submits their story (no account needed)
5. AI transforms it into multi-modal content (comic + audio + optional video)
6. Story appears in **The Feed** for everyone to see and experience
7. Users can browse, view, listen, and like stories

---

## 🏗️ Architecture Decisions

### ✅ YES - We Are Using:
- **MongoDB** - Main database for stories and prompts
- **GridFS** - File storage for audio/images within MongoDB
- **Gemini 3 Pro** - AI for story transformation (hackathon credits)
- **Gemini Multimodal** - Native audio transcription & image understanding
- **Express.js** - REST API backend
- **Curated Prompts** - Pre-defined templates stored in MongoDB to guide AI

### ❌ NO - We Are NOT Using:
- ~~Authentication/user accounts~~ - Anonymous platform
- ~~RAG/Vector databases~~ - Not retrieving past user submissions
- ~~Embeddings/semantic search~~ - Simple prompt-based approach
- ~~User profiles~~ - No user tracking
- ~~Personalized feeds~~ - Communal story pool for everyone

---

## 📊 Data Models

### 1. Story Model (Primary)
```javascript
{
  _id: ObjectId,
  type: 'speak' | 'write' | 'sketch',
  originalContent: String,        // Text or transcription
  fileId: GridFS_ID,              // Audio/image file reference
  aiNarrative: String,            // Generated comic narrative
  panels: [{                      // Comic panels
    panelNumber: Number,
    sceneDescription: String,
    dialogue: String,
    narration: String
  }],
  metadata: {
    createdAt: Date,
    views: Number,
    likes: Number,
    processingStatus: String
  },
  promptUsed: PromptTemplate_ID
}
```

### 2. PromptTemplate Model
```javascript
{
  _id: ObjectId,
  name: String,
  storyType: 'speak' | 'write' | 'sketch' | 'universal',
  template: String,               // Prompt with {placeholders}
  parameters: {                   // Gemini settings
    temperature: 0.9,
    maxTokens: 8192,
    topK: 40,
    topP: 0.95
  },
  isActive: Boolean,
  version: Number
}
```

---

## 🔄 Story Transformation Pipeline

```
┌──────────────────┐
│ User Submits     │
│ (speak/write/    │
│  sketch)         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Save File to     │ ← If audio/image
│ GridFS           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Send to Gemini   │ ← Audio/Image/Text
│ Multimodal API   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get Transcription│ ← For audio
│ or Description   │ ← For images
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Retrieve Prompt  │
│ Template from DB │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Inject Content   │
│ into Prompt      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Gemini Generates │
│ Comic Narrative  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Validate Output  │
│ (JSON structure) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Save Story to    │
│ MongoDB          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Return to User   │
│ & Add to Feed    │
└──────────────────┘
```

---

## 🌐 API Endpoints

### Core Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/stories` | Submit new story (speak/write/sketch) |
| `GET` | `/api/stories` | Get The Feed (paginated, all stories) |
| `GET` | `/api/stories/:id` | Get specific story details |
| `PUT` | `/api/stories/:id/like` | Like/unlike story |
| `GET` | `/api/files/:id` | Stream audio/image from GridFS |

### Admin Endpoints (Optional)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/prompts` | Get all prompt templates |
| `POST` | `/api/prompts` | Create new prompt template |
| `PUT` | `/api/prompts/:id` | Update prompt template |

---

## 🎯 The Feed (My Feed)

**What it is**: A communal pool of ALL stories submitted by ALL users

**How it works**:
- Frontend component: `Feed.js` (already implemented)
- Backend endpoint: `GET /api/stories`
- No authentication required
- No personalization (same feed for everyone)

**Features**:
- ✅ Pagination (20 stories per page)
- ✅ Filtering by type (speak/write/sketch/all)
- ✅ Sorting (recent, popular, trending)
- ✅ Like/view counts
- ✅ Audio playback for SPEAK stories
- ✅ Image display for SKETCH stories

---

## 💾 File Storage Strategy

### Primary: GridFS (MongoDB)
**Why GridFS**:
- ✅ No external dependencies
- ✅ Integrated with MongoDB (atomic operations)
- ✅ Handles files >16MB (chunks automatically)
- ✅ Free tier sufficient for hackathon
- ✅ Simple implementation

**What we store**:
- Audio files (MP3/WAV) - Max 10MB
- Sketch images (PNG/JPG) - Max 5MB
- Metadata linked to Story documents

### Alternatives (Optional):
- **Cloudinary**: For image optimization (free tier: 25 credits/month)
- **AWS S3**: For production scalability (pay-as-you-go)

---

## 🤖 Gemini AI Integration

### Why Gemini 3 Pro?
- ✅ Hackathon access (free/discounted credits)
- ✅ 2M token context window (huge!)
- ✅ Native multimodal support (audio, images, text)
- ✅ Single API for all processing needs
- ✅ Built-in safety filters

### What Gemini Does:
1. **Audio Processing**: Transcribes speech → text
2. **Image Processing**: Describes sketches → text
3. **Story Generation**: Transforms content → comic narrative
4. **Safety**: Filters inappropriate content automatically

### Fallback Strategy:
- Primary: Gemini 3 Pro (quality)
- Fallback: Gemini 1.5 Flash (if quota low, cheaper)

---

## 🔐 Security (No Authentication)

### How we prevent abuse without accounts:
- **IP-based rate limiting**: 100 requests per 15 min per IP
- **File upload limits**: 10 uploads per 15 min per IP
- **File validation**: Strict MIME type checking
- **Size limits**: 10MB audio, 5MB images
- **Content moderation**: Gemini's built-in safety filters

---

## 📈 Development Phases

### Phase 1: Foundation (Week 1-2)
- MongoDB setup + GridFS
- Story & PromptTemplate models
- Basic endpoints

### Phase 2: File Upload (Week 2-3)
- Multer configuration
- GridFS integration
- File validation

### Phase 3: AI Integration (Week 3-4) ⭐ CRITICAL
- Gemini API setup
- Prompt templates
- Transformation pipeline

### Phase 4: API Endpoints (Week 4-5)
- Story submission
- The Feed (GET /api/stories)
- Like/view functionality

### Phase 5-8: Polish, Testing, Deployment (Week 5-9)

---

## 💰 Cost Management

### During Hackathon:
- ✅ **Gemini API**: Free/discounted credits
- ✅ **MongoDB**: Free tier (512MB storage)
- ✅ **GridFS**: Included in MongoDB
- ✅ **Hosting**: Free tier (Render/Railway)

**Total Hackathon Cost**: ~$0 🎉

### Post-Hackathon (Estimate):
- **Gemini 3 Pro**: ~$0.0025-0.005 per story
- **MongoDB Atlas**: $9/month (M2 tier for production)
- **Hosting**: $7-20/month (depends on traffic)

**Total Monthly**: ~$20-30 for moderate traffic

---

## 🚀 Quick Start Checklist

1. [ ] Set up MongoDB connection
2. [ ] Create Story model
3. [ ] Create PromptTemplate model
4. [ ] Configure GridFS
5. [ ] Set up Gemini API (get hackathon key)
6. [ ] Create prompt templates (seed data)
7. [ ] Implement file upload (Multer)
8. [ ] Build transformation pipeline
9. [ ] Create REST endpoints
10. [ ] Test with frontend

---

## 📚 Key Differences from Original Plan

| Original Plan | ❌ | New Plan | ✅ |
|---------------|---|----------|---|
| RAG system with embeddings | ❌ | Simple prompt-based approach | ✅ |
| Vector database (Pinecone) | ❌ | MongoDB only | ✅ |
| User authentication | ❌ | Anonymous platform | ✅ |
| Personalized feed | ❌ | Communal feed for all | ✅ |
| User profiles & achievements | ❌ | Just stories, no users | ✅ |
| Complex retrieval system | ❌ | Direct Gemini generation | ✅ |

---

## 🎯 Success Criteria

**Minimum Viable Product (Hackathon)**:
- ✅ Users can submit stories (speak/write/sketch)
- ✅ AI transforms them into comic narratives
- ✅ Stories appear in The Feed
- ✅ Users can view and like stories
- ✅ Audio/image files work correctly

**Nice to Have**:
- Prompt versioning/A/B testing
- Admin panel for prompt management
- Analytics dashboard
- Content moderation enhancements

---

**Last Updated**: January 28, 2026
**Status**: Architecture Finalized, Ready for Implementation 🚀

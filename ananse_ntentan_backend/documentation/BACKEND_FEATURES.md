# Ananse Ntentan - Backend Features Documentation

## 📋 Project Overview
Backend API for Ananse Ntentan - A **story-sharing platform** powered by AI that helps people transform their stories (spoken, written, or sketched) into compelling **multi-modal narratives combining visual and audio storytelling**. This is an **open, anonymous platform** where anyone can share their stories and explore others' stories in a communal feed.

### 🧠 Core Concept
**Ananse Ntentan is an AI assistant that helps people share their stories.**

Users can submit their stories in three ways:
- 🎤 **SPEAK** - Record audio telling their story
- ✍️ **WRITE** - Type out their story as text
- 🎨 **SKETCH** - Upload drawings/images representing their story

The AI transforms these submissions into engaging **multi-modal narratives featuring both comic-style visuals and audio narration** and adds them to **The Feed** - a communal pool of stories that everyone can explore.

### 🎯 AI-Powered Story Generation (Prompt-Based System)
The system uses **curated prompts and guidelines** to ensure optimal story transformations:
- **Prompt Templates** - Pre-designed prompts optimized for different story types (managed with LangChain)
- **Artistic Styles** - Multiple visual styles (Cyberpunk, Noir, Manga, etc.) ⭐
- **Audio Styles** - Multiple audio narration styles (Cinematic, Lo-Fi, Synthwave, etc.) ⭐
- **Generation Guidelines** - Rules for consistent multi-modal narrative creation (visual + audio)
- **Style Parameters** - User-selectable aesthetic, panel structure, dialogue formatting, narration tone
- **Quality Control** - Validation rules via Pydantic output parsers
- **Gemini 3 Pro Integration** - Leveraging advanced LLM for creative storytelling
- **Audio Generation** - Text-to-Speech for narration using Google Cloud TTS or ElevenLabs API ⭐

---

## 🏗️ Infrastructure & Setup

### Technology Stack
- **Runtime**: Node.js v18+
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB with Mongoose ODM v9.1.4
- **File Storage**: GridFS (MongoDB) for multimedia files
- **LLM Integration**: Google Gemini 3 Pro (Hackathon Access) ⭐
- **Prompt Management**: LangChain + Google GenAI (@langchain/google-genai) ⭐
- **Audio Transcription**: Gemini Multimodal (native audio support)
- **Audio Generation**: Google Cloud Text-to-Speech (@google-cloud/text-to-speech) ⭐
- **Image Understanding**: Gemini Multimodal (native vision support)
- **Environment Management**: dotenv v17.2.3
- **CORS**: cors package for frontend integration
- **Security**: Helmet, express-mongo-sanitize, express-rate-limit
- **Development**: Nodemon v3.1.11
- **File Upload**: Multer v1.4.5-lts.1 with GridFS storage
- **Validation**: express-validator or Zod
- **Logging**: Morgan + Winston

### Project Structure
```
ananse_ntentan_backend/
├── controllers/       # Business logic handlers
├── middleware/        # Custom middleware (validation, error handling, file upload)
├── models/           # MongoDB/Mongoose schemas
├── routes/           # API endpoint definitions
├── config/           # Configuration files (DB, Gemini, storage)
├── utils/            # Helper functions (file processing, AI helpers)
├── prompts/          # Curated prompt templates for story generation ⭐
├── uploads/          # Temporary file storage (if using local storage)
├── tests/            # Test suites (planned)
└── server.js         # Entry point (to be created)
```

---

## ✅ Completed Backend Implementations

### 1. Initial Setup
- **Status**: ✅ Complete
- **Features**:
  - Package.json configured with core dependencies
  - Express.js framework installed
  - MongoDB/Mongoose integration prepared
  - CORS middleware for cross-origin requests
  - Development environment with nodemon
  - Environment variable management with dotenv

---

## 🔄 Planned Backend Features

### 1. Database Models (HIGH PRIORITY)
- **Status**: 🔨 Pending - Foundation Required
- **Planned Models**:
  
  **Story Model** ⭐
  - Story ID (unique identifier)
  - Type (speak/write/sketch)
  - Original content:
    - Audio file reference (GridFS ID) for SPEAK
    - Text content for WRITE
    - Image file reference (GridFS ID) for SKETCH
  - Transcription (for audio stories)
  - Processed output:
    - Comic-style narrative (JSON structure)
    - Panel descriptions (array of 3-6 panels)
    - Dialogue text
    - Scene settings
    - Narration script (for audio generation) ⭐
    - Generated audio file reference (GridFS ID) ⭐
    - Audio duration (seconds) ⭐
  - Style selections:
    - Visual style reference (ObjectId to ArtisticStyle) ⭐
    - Audio style reference (ObjectId to AudioStyle) ⭐
  - Metadata:
    - Timestamp (created date)
    - Views count
    - Likes count
    - Processing status (pending/processing/complete/failed)
    - Processing time (ms)
  - Prompt template used (reference to PromptTemplate)
  
  **PromptTemplate Model** ⭐
  - Template ID  
  **ArtisticStyle Model** ⭐
  - Style ID
  - Name (e.g., "Cyberpunk Neon", "Noir Graphic Novel", "Manga Style")
  - Slug (URL-friendly identifier)
  - Description (user-facing explanation)
  - Visual characteristics:
    - Color palette
    - Lighting style
    - Mood/atmosphere
    - Artistic influences
  - Prompt modifiers (injected into generation prompts)
  - Example panels (showcase the style)
  - Popularity count (track user preferences)
  - Is active flag
  
  **AudioStyle Model** ⭐
  - Style ID
  - Name (e.g., "Cinematic Epic", "Lo-Fi Chill", "Synthwave Retro")
  - Slug (URL-friendly identifier)
  - Description (user-facing explanation)
  - Voice characteristics:
    - Voice type (Google Cloud TTS voice name)
    - Speaking rate (0.25-4.0x)
    - Pitch (-20 to +20 semitones)
    - Volume gain (dB)
  - Audio effects:
    - Background music style
    - Ambient sounds
    - Audio processing (reverb, echo, etc.)
  - Mood/tone (dramatic, calm, energetic, mysterious)
  - Example audio clips (showcase the style)
  - Popularity count
  - Is active flag
  - Name (e.g., "SPEAK Story Generator", "SKETCH Story Enhancer")
  - Type (speak/write/sketch)
  - Prompt text (the actual curated prompt)
  - Guidelines (array of rules for generation)
  - Style parameters:
    - Comic aesthetic type (cyberpunk/traditional/etc.)
    - Panel structure preferences
    - Dialogue formatting rules
  - Version (for tracking prompt improvements)
  - Active status (enable/disable templates)
  - Performance metrics:
    - Success rate
    - Average generation time
    - User satisfaction scores

### 2. Prompt Management System ⭐
- **Status**: 🔨 Pending - CRITICAL
- **Purpose**: Store and manage curated prompts that guide Gemini to generate optimal story outputs
- **Features**:
  
  **Template Storage**
  - MongoDB collection for prompt templates
  - Version control for prompt iterations
  - A/B testing support for prompt optimization
  - Template categorization (by story type)
  
  **Prompt Engineering Guidelines**
  - Cyberpunk aesthetic rules
  - Comic panel structure (3-6 panels per story)
  - Dialogue formatting (speech bubbles, narration boxes)
  - Character consistency guidelines
  - Scene description templates
  - Emotional tone preservation
  
  **Dynamic Prompt Assembly**
  - Select appropriate template based on story type
  - Inject user content into template
  - Apply style parameters
  - Format for Gemini API consumption
  
  **Template Management API**
  - CRUD operations for prompt templates
  - Test prompt with sample content
  - Monitor prompt performance
  - Update templates based on output quality

### 3. Multimedia File Storage Strategy ⭐
- **Status**: 🔨 Pending - HIGH PRIORITY
- **Primary Approach**: GridFS (MongoDB)
  
  **GridFS Benefits**
  - Integrated with existing MongoDB setup
  - No external service dependencies
  - No additional API keys needed (hackathon-friendly)
  - Handles files > 16MB (BSON limit)
  - Built-in chunking and streaming
  - Automatic file versioning
  
  **GridFS Implementation**
  - Two collections: `fs.files` (metadata) and `fs.chunks` (data)
  - Store audio files (MP3/WAV) for SPEAK stories
  - Store images (PNG/JPEG) for SKETCH stories
  - File metadata: filename, contentType, length, uploadDate
  - Reference GridFS file IDs in Story model
  - Streaming support for large files
  
  **Alternative Options** (Future Consideration)
  
  *Cloudinary (Image-focused)*
  - Pros: Excellent image optimization, transformations, CDN
  - Cons: Less suitable for audio, requires API key setup
  - Use case: If visual quality becomes critical
  
  *AWS S3 (Enterprise-grade)*
  - Pros: Highly scalable, reliable, broad format support
  - Cons: Requires AWS account, billing setup, more complex
  - Use case: If scaling beyond hackathon/prototype
  
  **Recommendation for Hackathon**: Start with GridFS, migrate later if needed

### 4. Story Transformation Pipeline with Gemini ⭐
- **Status**: 🔨 Pending - CRITICAL
- **Pipeline Architecture**:
  
  **1. Input Processing**
  ```
  SPEAK: Audio file → GridFS storage → Gemini multimodal transcription
  WRITE: Text input → Direct to prompt assembly
  SKETCH: Image file → GridFS storage → Gemini vision analysis
  ```
  
  **2. Prompt Assembly**
  - Fetch appropriate PromptTemplate from database
  - Inject user content (transcription/text/image description)
  - Apply style guidelines from template
  - Format for Gemini API
  
  **3. Gemini Generation**
  - Send assembled prompt to Gemini 3 Pro API
  - Use multimodal capabilities:
    - Audio: Native audio processing (no separate transcription needed)
    - Text: Direct text-to-story transformation
    - Images: Native vision understanding
  - Configure generation parameters:
    - Temperature: 0.9 (high creativity)
    - Max tokens: 4096-8192
    - Top-k: 40, Top-p: 0.95
  - Handle streaming responses for real-time feedback
  
  **4. Output Processing**
  - Parse Gemini JSON response
  - Validate comic structure (panels, dialogue, scenes)
  - Extract narration script from generated story
  - Store visual narrative in Story model
  
  **5. Audio Generation** ⭐
  - Take narration script from Gemini output
  - Apply selected audio style parameters
  - Generate audio using Google Cloud Text-to-Speech
  - Store generated audio file in GridFS
  - Link audio file ID to Story document
  - Update story with audio metadata (duration, size)
  
  **6. Error Handling**
  - Retry logic for API failures (3 attempts)
  - Fallback to Gemini Flash for quota issues
  - Content validation (ensure appropriate output)
  - User-friendly error messages
  
  **Multi-Modal Pipeline** (Visual + Audio)
  ```
  User Submission + Style Selection
        ↓
  [File Storage] → Save to GridFS (if audio/image)
        ↓
  [Gemini Processing] → Transcribe/Analyze content
        ↓
  [Prompt Assembly] → Get template + inject content + style modifiers
        ↓
  [Gemini Generation] → Create comic-style story with narration script
        ↓
  [Visual Validation] → Check panel structure, dialogue format
        ↓
  [Audio Generation] → TTS from narration script with audio style ⭐
        ↓
  [Audio Storage] → Save audio to GridFS
        ↓
  [Store Complete Story] → Save to MongoDB (visual + audio)
        ↓
  [Add to Feed] → Make available to all users
  ```

### 5. The Feed API (Communal Story Pool) ⭐
- **Status**: 🔨 Pending
- **Purpose**: Display ALL stories from ALL users (no personalization, no authentication)
- **Features**:
  
  **Feed Retrieval**
  - Get all stories, sorted by recent (default)
  - Pagination (20 stories per page)
  - Optional sorting: most viewed, most liked, oldest first
  - No user filtering (anonymous platform)
  
  **Story Interaction**
  - View story (increment view count)
  - Like story (increment like count, no tracking who liked)
  - Simple engagement metrics
  
  **Feed Endpoints**
  - `GET /api/feed` - Get paginated stories
  - `GET /api/feed/:id` - Get specific story
  - `POST /api/feed/:id/view` - Increment view count
  - `POST /api/feed/:id/like` - Increment like count
  
  **Feed Algorithm**
  - Simple reverse chronological (newest first)
  - Optional: Popularity boost (high likes/views surface faster)
  - No AI recommendations, no personalization
  - Fast, transparent, fair

### 6. Story Submission API
- **Status**: 🔨 Pending
- **Routes**:
  - `POST /api/stories/speak` - Submit audio story (with style selections)
  - `POST /api/stories/write` - Submit text story (with style selections)
  - `POST /api/stories/sketch` - Submit image story (with style selections)
  - `GET /api/stories/:id/status` - Check processing status
  - `GET /api/styles/visual` - Get available visual styles ⭐
  - `GET /api/styles/audio` - Get available audio styles ⭐
  - `GET /api/files/audio/:id` - Stream generated audio file ⭐
  - `GET /api/files/image/:id` - Stream uploaded/generated images
  
- **Submission Flow**:
  1. User submits via multipart/form-data (audio/image) or JSON (text)
  2. Backend validates file type and size
  3. Store file in GridFS (if applicable)
  4. Create Story document with "pending" status
  5. Trigger transformation pipeline
  6. Update status to "processing" → "complete"
  7. Return story ID to frontend
  
- **File Validation**:
  - Audio: MP3, WAV, M4A (max 10MB)
  - Images: PNG, JPEG, JPG (max 5MB)
  - Text: Max 5000 characters
  - Sanitize all inputs

### 7. Middleware Implementation
- **Status**: 🔨 Pending
- **Planned Middleware**:
  - **Error handling**: Centralized error response formatting
  - **Request validation**: Joi/Zod schemas for inputs
  - **Rate limiting**: Prevent API abuse (100 requests/15min per IP)
  - **Request logging**: Morgan for HTTP logging
  - **File upload**: Multer + GridFS integration
  - **CORS**: Enable frontend communication
  - **Security**: Helmet for HTTP headers, express-mongo-sanitize

### 8. Processing Queue System
- **Status**: 🔨 Pending (Optional for MVP)
- **Purpose**: Handle story transformations asynchronously
- **Options**:
  - **Simple**: In-memory async processing (Node.js native)
  - **Advanced**: Bull/BullMQ with Redis (if scaling needed)
- **Features**:
  - Background job processing
  - Retry failed transformations
  - Status tracking (pending → processing → complete/failed)
  - Optional: Priority queue for high-demand periods

### 9. Testing Suite
- **Status**: 🔨 Pending
- **Planned Tests**:
  - Unit tests: Prompt assembly, file validation, error handling
  - Integration tests: Story submission → transformation → feed
  - API tests: All endpoints with various inputs
  - Gemini API mocking for testing without quota consumption
  - Test coverage goal: 70%+ (pragmatic for hackathon)

---

## 🗓️ Development Roadmap (Story-First Approach)

### Phase 1: Foundation (Days 1-3) ⭐ CRITICAL
- [ ] MongoDB connection setup
- [ ] Story model implementation
- [ ] PromptTemplate model implementation
- [ ] GridFS integration for file storage
- [ ] Basic Express server with routes
- [ ] Error handling middleware
- [ ] Environment configuration

### Phase 2: Gemini Integration (Days 4-6) ⭐ CRITICAL
- [ ] Gemini API client setup
- [ ] Audio transcription (multimodal)
- [ ] Image understanding (multimodal)
- [ ] Prompt assembly logic
- [ ] Story generation pipeline
- [ ] Response parsing and validation
- [ ] Test with sample inputs

### Phase 3: Story Submission (Days 7-9)
- [ ] File upload middleware (Multer + GridFS)
- [ ] Story submission endpoints (speak/write/sketch)
- [ ] File validation and sanitization
- [ ] Processing status tracking
- [ ] Error handling for failed submissions
- [ ] Integration testing

### Phase 4: The Feed (Days 10-11)
- [ ] Feed retrieval endpoint
- [ ] Pagination implementation
- [ ] View/Like increment endpoints
- [ ] Sorting options (recent, popular)
- [ ] Feed performance optimization
- [ ] Frontend integration testing

### Phase 5: Prompt Management (Days 12-13)
- [ ] Prompt template CRUD endpoints
- [ ] Seed database with initial templates
- [ ] Template versioning system
- [ ] Prompt testing interface (admin-only)
- [ ] Performance metrics tracking

### Phase 6: Polish & Testing (Days 14-15)
- [ ] Comprehensive testing suite
- [ ] Rate limiting implementation
- [ ] Security hardening
- [ ] API documentation (Swagger/Postman)
- [ ] Performance optimization
- [ ] Deployment preparation

### Phase 7: Deployment (Day 16+)
- [ ] Production environment setup
- [ ] MongoDB Atlas configuration
- [ ] Environment variables for production
- [ ] Health check endpoints
- [ ] Monitoring and logging
- [ ] Final integration testing

---

## 📊 Current Progress: 5%

### Completed:
- ✅ Project structure initialized
- ✅ Core dependencies installed (Express, Mongoose, Multer, etc.)
- ✅ Development environment configured
- ✅ Architecture documented (this file)

### In Progress:
- 🔨 Planning and design refinement

### Next Steps (Immediate - Priority Order):
1. **Environment Setup** (30 mins)
   - Create `.env` file with MongoDB URI, Gemini API key
   - Create `server.js` entry point with Express
   - Test basic server startup on port 5000

2. **Database Setup** (1 hour)
   - Create `config/database.js` for MongoDB connection
   - Implement `models/Story.js` with complete schema
   - Implement `models/PromptTemplate.js`
   - Implement `models/ArtisticStyle.js` ⭐
   - Implement `models/AudioStyle.js` ⭐
   - Set up GridFS connection for file storage

3. **Core Services** (2-3 hours)
   - Create `services/geminiService.js` (Gemini API client)
   - Create `services/audioService.js` (Google Cloud TTS) ⭐
   - Create `services/fileService.js` (GridFS operations)
   - Test each service independently

4. **First Endpoint - Text Submission** (2 hours)
   - Create `routes/stories.js`
   - Implement `POST /api/stories/write` endpoint
   - Create `controllers/storyController.js`
   - Test: text → Gemini → audio generation → storage

5. **Seed Database** (1 hour)
   - Create `scripts/seedStyles.js` with initial visual/audio styles
   - Create `scripts/seedPrompts.js` with prompt templates
   - Run seeds to populate database

6. **Complete Story Pipeline** (3-4 hours)
   - Implement `POST /api/stories/speak` with file upload
   - Implement `POST /api/stories/sketch` with image upload
   - Add style selection to all endpoints
   - Test full multi-modal pipeline

7. **Feed API** (2 hours)
   - Create `routes/feed.js`
   - Implement `GET /api/feed` with pagination
   - Implement `GET /api/feed/:id`
   - Implement like/view increment endpoints

8. **File Streaming** (1 hour)
   - Implement `GET /api/files/audio/:id` for audio streaming ⭐
   - Implement `GET /api/files/image/:id` for images
   - Test audio playback in browser

**Total Estimated Time: 12-15 hours of focused development**

---

## 🔗 Integration Points with Frontend

### API Base URL
- Development: `http://localhost:5000/api`
- Production: TBD

### Key Integration Requirements
1. **Homepage SPEAK/WRITE/SKETCH Submission**
   - Frontend submits to:
     - `/api/stories/speak` (audio file via multipart/form-data)
     - `/api/stories/write` (text via JSON)
     - `/api/stories/sketch` (image file via multipart/form-data)
   - Backend processes with Gemini and stores in MongoDB
   - Returns story ID and processing status

2. **My Feed Display**
   - Frontend fetches from `/api/feed` (paginated)
   - Backend returns all stories (communal pool)
   - No authentication required
   - Includes view/like counts for each story

3. **Story Viewing**
   - Frontend fetches specific story from `/api/feed/:id`
   - Backend returns full story with comic panels
   - Increment view count on load

4. **Story Interactions**
   - Like: `POST /api/feed/:id/like` (no user tracking)
   - View tracking happens automatically
   - Simple engagement metrics

5. **Processing Status**
   - Poll `/api/stories/:id/status` for transformation progress
   - Status: pending → processing → complete → failed
   - Optional: WebSocket for real-time updates (Phase 2)

---

## 🛠️ Environment Variables (Template)

```env
# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=5000
NODE_ENV=development

# ========================================
# DATABASE (MongoDB)
# ========================================
MONGODB_URI=mongodb://localhost:27017/ananse_ntentan
# Production: Use MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ananse_ntentan

# ========================================
# GEMINI API (Hackathon Access) ⭐
# ========================================
GEMINI_API_KEY=your_gemini_api_key_from_hackathon
GEMINI_MODEL=gemini-1.5-pro-latest
GEMINI_FLASH_MODEL=gemini-1.5-flash-latest  # Fallback for cost savings

# ========================================
# GOOGLE CLOUD TEXT-TO-SPEECH ⭐
# ========================================
GOOGLE_TTS_API_KEY=your_google_cloud_api_key
# OR use service account JSON
GOOGLE_APPLICATION_CREDENTIALS=./config/google-cloud-credentials.json

# Default TTS Settings
DEFAULT_TTS_VOICE=en-US-Neural2-J
DEFAULT_TTS_LANGUAGE=en-US
DEFAULT_SPEAKING_RATE=1.0
DEFAULT_PITCH=0.0
AUDIO_OUTPUT_FORMAT=MP3

# Gemini Generation Parameters
GEMINI_TEMPERATURE=0.9         # Creativity (0.0-2.0)
GEMINI_MAX_TOKENS=8192         # Max output length
GEMINI_TOP_P=0.95              # Nucleus sampling
GEMINI_TOP_K=40                # Top-k sampling
GEMINI_SAFETY_SETTINGS=BLOCK_ONLY_HIGH  # Content safety level

# ========================================
# FILE STORAGE (GridFS)
# ========================================
# GridFS is integrated with MongoDB - no additional config needed
MAX_FILE_SIZE_AUDIO=10485760   # 10MB in bytes
MAX_FILE_SIZE_IMAGE=5242880    # 5MB in bytes
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/m4a
ALLOWED_IMAGE_TYPES=image/png,image/jpeg,image/jpg

# Alternative Storage (if needed later)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
# AWS_S3_BUCKET=
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=

# ========================================
# API RATE LIMITING
# ========================================
RATE_LIMIT_WINDOW=15           # Minutes
RATE_LIMIT_MAX_REQUESTS=100    # Requests per window per IP
MAX_STORIES_PER_IP_PER_DAY=50  # Prevent spam

# Gemini API Quota Management (Hackathon)
HACKATHON_CREDITS_AVAILABLE=true
MAX_GEMINI_REQUESTS_PER_DAY=10000
ENABLE_USAGE_ALERTS=true
FALLBACK_TO_FLASH=true         # Auto-switch to Flash when quota low

# ========================================
# CORS & FRONTEND
# ========================================
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# ========================================
# PROMPT MANAGEMENT
# ========================================
DEFAULT_SPEAK_TEMPLATE_ID=speak_v1
DEFAULT_WRITE_TEMPLATE_ID=write_v1
DEFAULT_SKETCH_TEMPLATE_ID=sketch_v1
ENABLE_PROMPT_VERSIONING=true

# ========================================
# PROCESSING OPTIONS
# ========================================
ENABLE_ASYNC_PROCESSING=false  # true for queue system (requires Redis)
PROCESSING_TIMEOUT=120000      # 2 minutes max per story
MAX_RETRIES=3                  # Retry failed Gemini calls

# Background Queue (Optional - if using Bull/BullMQ)
# REDIS_URL=redis://localhost:6379
# QUEUE_CONCURRENCY=5

# ========================================
# MONITORING & LOGGING
# ========================================
ENABLE_LOGGING=true
LOG_LEVEL=info                 # debug, info, warn, error
LOG_FILE_PATH=./logs/app.log

# Error Tracking (Optional)
# SENTRY_DSN=your_sentry_dsn

# ========================================
# SECURITY
# ========================================
# No JWT needed (anonymous platform)
HELMET_ENABLED=true            # Secure HTTP headers
MONGO_SANITIZE_ENABLED=true    # Prevent NoSQL injection

# ========================================
# DEVELOPMENT ONLY
# ========================================
ENABLE_API_DOCS=true           # Swagger UI
MOCK_GEMINI_API=false          # For testing without using quota
```

---

## 📝 Notes & Considerations

### Performance Optimization
- **GridFS Streaming**: Use streaming for large file uploads/downloads to minimize memory usage
- **MongoDB Indexing**: 
  - Index `Story.createdAt` for feed sorting
  - Index `Story.type` for filtering by story type
  - Index `Story.status` for processing queue queries
- **Caching Strategy**:
  - Cache popular stories (high view/like counts) in memory or Redis
  - Cache prompt templates (rarely change)
  - Consider HTTP caching headers for GET endpoints
- **Pagination**: Implement cursor-based pagination for large feed datasets
- **Response Compression**: Enable gzip/Brotli for API responses

### Scalability Considerations
- **Horizontal Scaling**: Design stateless API (no session storage)
- **Database Sharding**: MongoDB supports sharding if story count grows massive
- **CDN Integration**: Serve static story content via CDN (future enhancement)
- **Microservices Path**: 
  - Story Service (submission & feed)
  - Processing Service (Gemini transformations)
  - File Service (GridFS/storage)
- **Load Balancing**: Use Nginx or cloud load balancers for production

### Cost Management (Hackathon Credits)
- **Gemini Hackathon Access** ⭐
  - Monitor free tier limits closely
  - Track requests per day/minute
  - Implement usage dashboard for admins
  - Set up alerts when approaching limits
- **Gemini Flash Fallback**:
  - Auto-switch to cheaper Gemini Flash model when quota low
  - Flash is 10x cheaper but slightly less capable
  - Still excellent for story generation
- **Post-Hackathon Planning**:
  - Gemini Pricing: ~$0.0025/1K input, ~$0.01/1K output tokens
  - Budget for 1000 stories/day ≈ $20-50/month
  - Consider freemium: Free tier (10 stories/day) + paid unlimited
- **GridFS vs Cloud Storage**:
  - GridFS: Free (included with MongoDB)
  - Cloudinary: Free tier 25GB storage, 25GB bandwidth/month
  - AWS S3: ~$0.023/GB/month storage + bandwidth costs
  - Recommendation: Start GridFS, migrate if storage exceeds 50GB

### Security Best Practices
- **Input Validation**: Validate ALL user inputs (file types, sizes, text length)
- **File Sanitization**: 
  - Check file magic numbers (not just extension)
  - Scan uploaded files for malware (ClamAV in production)
  - Strip EXIF data from images
- **Content Moderation**:
  - Use Gemini's built-in safety filters
  - Implement profanity filter for text inputs
  - Report system for inappropriate content (manual review)
- **Rate Limiting**: Prevent abuse with IP-based limits
- **MongoDB Security**:
  - Use MongoDB Atlas with encryption at rest
  - Enable authentication (username/password)
  - Whitelist IP addresses
  - Use `express-mongo-sanitize` to prevent injection
- **API Security**:
  - Helmet.js for secure HTTP headers
  - CORS configuration (only allow frontend origin)
  - Hide error stack traces in production

### Monitoring & Observability
- **Key Metrics to Track**:
  - Story submission rate (per hour/day)
  - Gemini API success rate (%)
  - Average processing time (seconds)
  - Error rate by endpoint
  - Storage usage (GridFS size)
  - API response times (p50, p95, p99)
- **Logging Strategy**:
  - Use Morgan for HTTP request logging
  - Winston for application logging
  - Log levels: debug (dev), info (prod), error (always)
  - Rotate log files daily
- **Health Checks**:
  - `/health` endpoint: Check MongoDB, Gemini API, disk space
  - Uptime monitoring (UptimeRobot, Pingdom)
- **Error Tracking**:
  - Sentry for crash reporting (optional)
  - Alert on repeated errors (email/Slack)

### Backup & Recovery
- **MongoDB Backups**:
  - MongoDB Atlas: Automated continuous backups
  - Self-hosted: Daily mongodump to cloud storage
  - Retention: 7 daily, 4 weekly, 3 monthly backups
- **GridFS Backup**:
  - Included in MongoDB backups
  - Consider separate backup for large files (S3 glacier)
- **Disaster Recovery**:
  - Document restore procedures
  - Test restoration monthly
  - Keep environment variables in secure vault (1Password, AWS Secrets Manager)
- **Code Versioning**:
  - Git repository with semantic versioning
  - Tag releases (v1.0.0, v1.1.0, etc.)
  - Branch strategy: main (prod), develop (staging), feature branches

### Content Moderation Strategy
- **Automated Moderation**:
  - Gemini Safety Settings: Block hateful, violent, sexual content
  - Profanity filter for text inputs
  - Image content analysis (Gemini vision) for inappropriate sketches
- **Community Reporting**:
  - "Report Story" button (frontend feature)
  - Store reports in MongoDB
  - Admin review dashboard
- **Manual Review**:
  - Flag high-risk submissions for review before going live
  - Moderator interface to approve/reject stories
  - Ban IPs that submit inappropriate content repeatedly

---

## 🤝 Contributing Guidelines

### Code Standards
- Follow ESLint configuration
- Use async/await for asynchronous operations
- Implement proper error handling (try-catch blocks)
- Write descriptive commit messages (Conventional Commits)
- Use meaningful variable names (no single letters except loop iterators)

### File Organization
- Controllers: Business logic only (no DB queries directly)
- Models: Mongoose schemas and methods
- Routes: Endpoint definitions with validation middleware
- Utils: Reusable helper functions
- Prompts: Curated prompt templates (JSON or JS modules)

### Testing Requirements (Pragmatic for Hackathon)
- Test critical paths: story submission → processing → feed
- Mock Gemini API to avoid quota consumption during tests
- Integration tests for main endpoints
- Target: 70%+ coverage (prioritize quality over quantity)

### Documentation Standards
- JSDoc comments for all exported functions
- API endpoint documentation (Swagger/Postman collection)
- Update this file when adding new features
- Include example requests/responses in route files

### Git Workflow
- Branch naming: `feature/story-submission`, `fix/gemini-timeout`
- Commit messages: `feat: add GridFS file storage`, `fix: handle Gemini API errors`
- Pull request template: What, Why, Testing done
- Code review before merging to main

---

**Last Updated**: January 28, 2026  
**Version**: 0.2.0 (Architecture Redesign - Story-First, No Auth, No RAG)  
**Status**: 🔨 In Active Development  
**Target**: Hackathon-Ready MVP in 16 days

# Ananse Ntentan - Backend Features Documentation

## Overview
The backend is built with **Node.js/Express** and provides a RESTful API + WebSocket server for multimodal story generation, real-time chat, and file management. It leverages **Google Gemini AI** for narrative generation, audio transcription, and image analysis.

---

## Core Features

### 1. **Multi-Modal Story Processing**
**Status**: ✅ Fully Implemented

**Three Input Types** (storyController.js):

#### A. Text Input (`POST /api/stories/write`)
- Accepts plain text (up to 5000 characters)
- User preference integration (genre, mood, pacing, tone, art style)
- Async story generation with status tracking
- Returns story ID immediately, processes in background

#### B. Voice Input (`POST /api/stories/speak`)
- Accepts audio files (WebM, MP3, WAV)
- Gemini multimodal audio transcription
- Converts speech to text
- Generates story from transcribed content

#### C. Image Input (`POST /api/stories/sketch`)
- Accepts image uploads (PNG, JPG, JPEG, GIF, WEBP)
- Gemini vision API for image analysis
- Describes scene, characters, mood, colors
- Generates narrative from image description

**Common Processing Pipeline**:
1. Validate and save input to MongoDB
2. Transcribe/analyze content (if audio/image)
3. Generate story structure with Gemini
4. Create visual panels based on panel count preference
5. Generate images for each panel
6. Generate audio narration (optional)
7. Update story status to 'complete'

---

### 2. **AI-Powered Story Generation (geminiService.js)**
**Status**: ✅ Fully Implemented

**Gemini API Integration**:
- Model: gemini-2.5-flash (configurable)
- Structured JSON output for story panels
- Multimodal capabilities (text, audio, image)

**Core Methods**:
- `generateStory()` - Creates structured narrative with panels
- `transcribeAudio()` - Speech-to-text conversion
- `analyzeImage()` - Visual content description
- `assemblePrompt()` - Combines user content + templates + preferences

**Prompt Engineering**:
- Base template system (PromptTemplate model)
- Visual style modifiers injection
- User preference integration:
  - Genre keywords (sci-fi, fantasy, horror, etc.)
  - Mood descriptors (dark, bright, mysterious)
  - Tone specifications (serious, humorous, dramatic)
  - Pacing control (3, 5, or 7 panels)
  - Art style preferences (comic, manga, watercolor)

**Output Structure**:
```json
{
  "title": "Story Title",
  "panels": [
    {
      "number": 1,
      "scene": "Scene description",
      "dialogue": "Character dialogue",
      "description": "Visual details"
    }
  ]
}
```

---

### 3. **Image Generation (imageService.js)**
**Status**: ✅ Fully Implemented

**Multiple Provider Support**:
- **Gemini Image** (default): Nano Banana / Nano Banana Pro
- **Stability AI**: Stable Diffusion via API
- **Imagen 3**: Google Vertex AI (premium)

**Features**:
- Dynamic prompt building from panel data
- Visual style modifier integration
- Configurable via `IMAGE_PROVIDER` env variable
- Fallback error handling
- Image buffer storage in MongoDB GridFS

**Prompt Construction**:
- Scene description
- Character dialogue context
- Visual style keywords
- Art style modifiers (from user preferences)

---

### 4. **Audio Generation (audioService.js)**
**Status**: ✅ Fully Implemented

**Features**:
- Text-to-speech narration
- Google Cloud TTS integration
- Multiple voice options
- Configurable language and speaking rate
- Audio stored as MP3 in GridFS

**Capabilities**:
- Generates narration from story text
- Optional audio output (can be disabled)
- Voice customization per audio style

---

### 5. **File Management (fileService.js)**
**Status**: ✅ Fully Implemented

**GridFS Integration**:
- Stores images, audio, and uploaded files
- MongoDB GridFS for large file handling
- Efficient streaming for file retrieval

**Supported Operations**:
- Upload files (images, audio)
- Retrieve files by ID
- Delete files
- Stream large files

**File Types**:
- Images: PNG, JPG, JPEG, GIF, WEBP
- Audio: MP3, WAV, WebM
- Size limits: 10MB per file

---

### 6. **Real-Time Anonymous Chat (WebSocket)**
**Status**: ✅ Fully Implemented

**WebSocket Server** (server.js):
- Port: Same as HTTP server (5000)
- Protocol: ws:// (wss:// for production)

**Features**:
- Anonymous user registration (void_[timestamp]_[random])
- Random matching algorithm with waiting queue
- Real-time message broadcasting
- Room management (create, join, leave)
- Message persistence in MongoDB
- Connection status tracking

**Message Types**:
- `register` - User connects with anonymous ID
- `find_match` - Request random chat partner
- `send_message` - Send message to room
- `join_room` - Join existing conversation
- `leave_room` - Exit chat room
- `get_rooms` - Fetch chat history

**Matching Algorithm**:
- FIFO queue for waiting users
- Automatic room creation on match
- Notification to both parties
- Past chat history retrieval

---

### 7. **Story Feed & Pagination (feedController.js)**
**Status**: ✅ Fully Implemented

**Endpoints**:
- `GET /api/feed` - Paginated story list
- `GET /api/stories/:id` - Single story detail
- `GET /api/stories/:id/status` - Check generation status
- `POST /api/feed/:id/like` - Like a story

**Features**:
- Pagination (default 10, customizable)
- Sort by creation date (newest first)
- Only shows complete stories
- Like count tracking
- Story metadata (type, date, stats)

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (default: 'complete')

---

### 8. **Chat API Routes (routes/chat.js)**
**Status**: ✅ Fully Implemented

**Endpoints**:
- `GET /api/chat/rooms/:userId` - Get user's chat rooms
- `GET /api/chat/room/:roomId/messages` - Fetch room messages
- `POST /api/chat/room/create` - Create new chat room
- `DELETE /api/chat/room/:roomId` - Delete room

**Features**:
- Room history with last message preview
- Message pagination (50 per request)
- Room participant validation (exactly 2)
- Automatic timestamp sorting

---

### 9. **Database Models (Mongoose)**
**Status**: ✅ Fully Implemented

**Core Models**:

#### Story Model (models/Story.js)
```javascript
{
  type: String (write/speak/sketch),
  originalContent: { text/audioFileId/imageFileId },
  visualNarrative: {
    title: String,
    panels: [{
      number, scene, dialogue, description,
      imageFileId
    }]
  },
  audioNarrative: { audioFileId, duration },
  visualStyleId, audioStyleId,
  status: String (pending/processing/complete/failed),
  metadata: { likes, views },
  createdAt, updatedAt
}
```

#### ChatRoom Model (models/ChatRoom.js)
```javascript
{
  participants: [String], // Array of anonymous IDs
  active: Boolean,
  createdAt, updatedAt
}
```

#### ChatMessage Model (models/ChatMessage.js)
```javascript
{
  roomId: ObjectId,
  senderId: String,
  content: String (max 2000 chars),
  type: String (text/system),
  read: Boolean,
  createdAt
}
```

#### ArtisticStyle Model (models/ArtisticStyle.js)
```javascript
{
  name, slug,
  promptModifiers: [String],
  description
}
```

#### AudioStyle Model (models/AudioStyle.js)
```javascript
{
  name, slug, voiceName,
  languageCode, speakingRate
}
```

#### PromptTemplate Model (models/PromptTemplate.js)
```javascript
{
  name, slug, promptText,
  category, isDefault
}
```

---

### 10. **Video Generation (videoService.js)**
**Status**: 🚧 Implemented but Optional

**Features**:
- FFmpeg-based video assembly
- Combines images + audio into MP4
- Configurable frame duration
- Audio sync capabilities

**Note**: Video generation is available but not actively used in current flow. Can be enabled for future features.

---

## Technical Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express 5.x
- **Database**: MongoDB 6.0+ with Mongoose ODM
- **AI**: Google Gemini API (gemini-2.5-flash)

### Key Dependencies
```json
{
  "@google/generative-ai": "^0.24.1",
  "@google-cloud/text-to-speech": "^6.4.0",
  "express": "^5.2.1",
  "mongoose": "^9.1.4",
  "ws": "^8.x",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.2",
  "helmet": "^8.1.0",
  "cors": "^2.8.6"
}
```

### Middleware
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **multer**: File upload handling
- **errorHandler**: Centralized error handling

---

## API Endpoints

### Story Creation
```
POST /api/stories/write
POST /api/stories/speak
POST /api/stories/sketch
```

### Story Retrieval
```
GET /api/stories/:id
GET /api/stories/:id/status
GET /api/feed?page=1&limit=10
```

### Story Interaction
```
POST /api/feed/:id/like
```

### File Access
```
GET /api/files/image/:id
GET /api/files/audio/:id
```

### Chat (REST)
```
GET /api/chat/rooms/:userId
GET /api/chat/room/:roomId/messages
POST /api/chat/room/create
DELETE /api/chat/room/:roomId
```

### WebSocket Events
```
register - Connect with anonymous ID
find_match - Request random partner
send_message - Send message to room
join_room - Join existing room
leave_room - Exit chat
get_rooms - Fetch user's rooms
```

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://[credentials]

# Google Gemini AI
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash

# Image Generation
IMAGE_PROVIDER=gemini-image
STABILITY_API_KEY=optional

# Google Cloud TTS (Optional)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# File Upload
MAX_FILE_SIZE=10485760
```

---

## Performance Optimizations

1. **Async Processing**: Stories generate in background
2. **Status Polling**: Frontend polls for completion
3. **GridFS**: Efficient large file storage
4. **MongoDB Indexes**: Optimized queries on story status, date
5. **WebSocket Connection Reuse**: Single connection per user
6. **Error Handling**: Graceful fallbacks, user-friendly messages

---

## Security Features

1. **Input Validation**: Text length limits, file type checks
2. **Helmet.js**: Security headers
3. **CORS**: Restricted cross-origin access
4. **Anonymous IDs**: No PII storage
5. **Rate Limiting**: Ready for express-rate-limit
6. **Error Sanitization**: No stack traces in production

---

## Scalability Considerations

**Current Architecture**:
- Single server instance
- MongoDB for persistence
- In-memory WebSocket connection tracking

**Ready for Scale**:
- Horizontal scaling with Redis for WebSocket state
- CDN for static file serving
- MongoDB replica sets for redundancy
- Load balancer for multiple instances
- Message queue (Bull/RabbitMQ) for story processing

---

## Known Limitations

1. **Story Generation Time**: 30-90 seconds depending on panel count
2. **Image Provider Availability**: Dependent on external APIs
3. **WebSocket Connections**: In-memory (not distributed)
4. **File Storage**: MongoDB GridFS (consider S3 for production)
5. **Audio Transcription**: Requires Gemini API quota

---

## Future Enhancements

- [ ] Story editing/remix capabilities
- [ ] Advanced matching algorithms (interest-based)
- [ ] Story collections and favorites
- [ ] User reputation system
- [ ] Story search and filtering
- [ ] Multiple language support
- [ ] Video story export
- [ ] Webhook notifications
- [ ] Admin dashboard
- [ ] Analytics and metrics

---

## Error Handling

**Story Creation Errors**:
- Invalid input → 400 Bad Request
- AI generation failure → Story status 'failed'
- File upload issues → Detailed error messages
- Timeout handling → 2-minute limit on frontend

**WebSocket Errors**:
- Connection drops → Auto-reconnect on frontend
- Message failures → Retry logic
- Room not found → Graceful error messages

**Database Errors**:
- Connection issues → Retry with exponential backoff
- Validation errors → User-friendly messages
- Duplicate keys → Handled with unique indexes

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use WSS (secure WebSocket)
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Configure CORS for production domain
- [ ] Set up CDN for file delivery
- [ ] Enable request logging (Morgan/Winston)
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure rate limiting
- [ ] Set up backup schedules
- [ ] Enable error tracking (Sentry)

---

## Monitoring & Logging

**Current Logging**:
- Console logs for development
- Error stack traces
- WebSocket connection events
- Story generation progress

**Production Recommendations**:
- Winston for structured logging
- MongoDB slow query logs
- API request/response logging
- Error aggregation (Sentry)
- Performance monitoring (New Relic/DataDog)

---

## Testing

**Current Status**: Manual testing
**Test Coverage**: Core endpoints validated

**Recommended Tests**:
- Unit tests for services (Jest)
- Integration tests for API endpoints (Supertest)
- WebSocket event testing
- Database model validation
- Image generation mocking
- Audio transcription tests
- E2E tests with frontend

---

## Development Commands

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Seed database with prompt templates
npm run seed:prompts

# Test image generation
npm run test:image

# Test audio services
npm run test:audio

# Check database stories
node scripts/checkData.js
```

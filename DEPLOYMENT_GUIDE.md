# Ananse Ntentan - Project Architecture & Deployment Guide

## 🎯 Project Overview

**Ananse Ntentan** is an AI-powered narrative platform that democratizes storytelling by allowing anyone to transform their raw ideas (text, voice, or images) into fully realized visual stories through multimodal AI.

### Core Vision
- **AI as Creative Companion**: Technology amplifies human creativity, doesn't replace it
- **Accessibility First**: No artistic skill required—just raw ideas
- **Anonymous Expression**: Free creative space without judgment
- **Personalized Experience**: AI adapts to individual preferences
- **Community Connection**: Share stories and connect through anonymous chat

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                      │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐   │
│  │  Quiz    │  │ HomePage │  │  Feed   │  │     Chat     │   │
│  │ System   │  │ (Create) │  │ (View)  │  │ (WebSocket)  │   │
│  └──────────┘  └──────────┘  └─────────┘  └──────────────┘   │
│                                                                   │
│  PreferencesContext (localStorage) → Anonymous ID               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                   REST API / WebSocket
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                    BACKEND (Node.js/Express)                    │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │   REST API   │   │  WebSocket   │   │   AI Services    │  │
│  │   Routes     │   │   Server     │   │                  │  │
│  │              │   │              │   │  - Gemini AI     │  │
│  │ - Stories    │   │ - Chat       │   │  - Image Gen     │  │
│  │ - Feed       │   │ - Matching   │   │  - Audio TTS     │  │
│  │ - Files      │   │ - Messages   │   │  - Transcription │  │
│  │ - Chat       │   │              │   │  - Image Analysis│  │
│  └──────────────┘   └──────────────┘   └──────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Story Processing Pipeline                     │  │
│  │                                                            │  │
│  │  Input → AI Generation → Image Creation →                 │  │
│  │  Audio Narration → GridFS Storage → Status Update         │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                      DATABASE LAYER                             │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │               MongoDB Atlas (Cloud)                        │ │
│  │                                                            │ │
│  │  Collections:                                             │ │
│  │  - stories (narratives)        - chatrooms (chat data)   │ │
│  │  - prompttemplates (AI guides) - chatmessages (messages) │ │
│  │  - artisticstyles (visual)     - audiostyles (audio)     │ │
│  │                                                            │ │
│  │  GridFS: Images, Audio Files                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
ananse_ntentan/
├── ananse_ntentan_frontend/          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── Components/               # UI Components
│   │   │   ├── HomePage.js          # Story creation
│   │   │   ├── Feed.js              # Story feed
│   │   │   ├── Chat.js              # Anonymous chat
│   │   │   ├── Quiz.js              # Preference calibration
│   │   │   ├── Settings.js          # User settings
│   │   │   ├── About.js             # About page
│   │   │   ├── Navbar.js            # Navigation
│   │   │   └── UserProfile.js       # Profile (placeholder)
│   │   ├── context/
│   │   │   └── PreferencesContext.js # Global state
│   │   ├── App.js                   # Route configuration
│   │   └── index.js                 # Entry point
│   ├── package.json
│   └── .env.local                   # Environment config
│
├── ananse_ntentan_backend/           # Node.js Backend
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── controllers/
│   │   ├── storyController.js       # Story endpoints logic
│   │   └── feedController.js        # Feed endpoints logic
│   ├── models/                      # Mongoose schemas
│   │   ├── Story.js
│   │   ├── ChatRoom.js
│   │   ├── ChatMessage.js
│   │   ├── ArtisticStyle.js
│   │   ├── AudioStyle.js
│   │   └── PromptTemplate.js
│   ├── routes/                      # API routes
│   │   ├── stories.js
│   │   ├── feed.js
│   │   ├── files.js
│   │   ├── styles.js
│   │   └── chat.js
│   ├── services/                    # Business logic
│   │   ├── geminiService.js        # AI generation
│   │   ├── imageService.js         # Image generation
│   │   ├── audioService.js         # TTS narration
│   │   ├── fileService.js          # GridFS file ops
│   │   └── videoService.js         # Video assembly
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── scripts/                     # Utility scripts
│   │   ├── seedPrompts.js
│   │   ├── seedStyles.js
│   │   └── checkData.js
│   ├── server.js                    # Express + WebSocket server
│   ├── package.json
│   └── .env                         # Environment config
│
├── FRONTEND_FEATURES.md             # Frontend documentation
├── BACKEND_FEATURES.md              # Backend documentation
└── README.md                        # Project overview
```

---

## 🚀 Deployment Guide

### Prerequisites

1. **Node.js**: v18+ installed
2. **MongoDB Atlas**: Cloud database account
3. **Google Gemini API**: API key from Google AI Studio
4. **Git**: Version control
5. **GitHub**: Repository hosting
6. **Render/Heroku/Vercel**: Hosting platforms

---

### Step 1: Prepare for GitHub

#### Create .gitignore (root)
```bash
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.production

# Build outputs
ananse_ntentan_frontend/build/
ananse_ntentan_backend/dist/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temp files
*.tmp
*.swp
```

#### Initialize Git Repository
```bash
cd "c:\Users\mccly\Desktop\My projects\ananse_ntentan"

git init
git add .
git commit -m "Initial commit: Ananse Ntentan - AI Storytelling Platform"
```

#### Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Name: `ananse-ntentan`
3. Description: "AI-powered multimodal storytelling platform"
4. Public or Private (your choice)
5. Don't initialize with README (we have one)

#### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/ananse-ntentan.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Backend (Render)

#### Create render.yaml (root)
```yaml
services:
  - type: web
    name: ananse-ntentan-backend
    env: node
    buildCommand: cd ananse_ntentan_backend && npm install
    startCommand: cd ananse_ntentan_backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: FRONTEND_URL
        value: https://your-frontend-url.vercel.app
      - key: IMAGE_PROVIDER
        value: gemini-image
      - key: GEMINI_MODEL
        value: gemini-2.5-flash
```

#### Deploy Steps:
1. Go to [render.com](https://render.com)
2. Sign up / Log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: ananse-ntentan-backend
   - **Root Directory**: `ananse_ntentan_backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_connection_string
     GEMINI_API_KEY=your_gemini_api_key
     FRONTEND_URL=https://your-frontend.vercel.app
     IMAGE_PROVIDER=gemini-image
     ```
6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://ananse-ntentan-backend.onrender.com`

---

### Step 3: Deploy Frontend (Vercel)

#### Create vercel.json (frontend directory)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Update Frontend .env.local → .env.production
```env
REACT_APP_API_URL=https://ananse-ntentan-backend.onrender.com
REACT_APP_WS_URL=wss://ananse-ntentan-backend.onrender.com
```

#### Deploy Steps:
1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in with GitHub
3. Click "Add New..." → "Project"
4. Import your `ananse-ntentan` repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `ananse_ntentan_frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://ananse-ntentan-backend.onrender.com
     REACT_APP_WS_URL=wss://ananse-ntentan-backend.onrender.com
     ```
6. Click "Deploy"
7. Wait for deployment (3-5 minutes)
8. Your app is live at: `https://ananse-ntentan.vercel.app`

---

### Step 4: Configure MongoDB Atlas

1. Log into [cloud.mongodb.com](https://cloud.mongodb.com)
2. Go to "Network Access"
3. Click "Add IP Address"
4. Add Render's IP ranges OR select "Allow Access from Anywhere" (0.0.0.0/0)
5. Go to "Database Access"
6. Ensure your database user has read/write permissions

---

### Step 5: Update Backend CORS

In backend `server.js`, update CORS to allow your frontend:
```javascript
app.use(cors({ 
  origin: [
    'http://localhost:3000',
    'https://ananse-ntentan.vercel.app'
  ]
}));
```

Commit and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

Render will auto-redeploy.

---

### Step 6: Seed Database (Production)

Option 1: Run locally with production MongoDB:
```bash
cd ananse_ntentan_backend
# Set MONGODB_URI to production in .env
npm run seed:prompts
npm run seed:styles  # If you created this script
```

Option 2: Use Render Shell:
1. Go to Render dashboard
2. Select your backend service
3. Click "Shell" tab
4. Run: `npm run seed:prompts`

---

### Step 7: Test Deployment

1. Visit your Vercel URL
2. Complete the preference quiz
3. Create a story (write mode)
4. Check feed for the story
5. Test chat functionality
6. Verify WebSocket connection

**Common Issues**:
- **Stories not appearing**: Check MongoDB connection
- **WebSocket not connecting**: Ensure WSS protocol in production
- **CORS errors**: Update backend CORS settings
- **Images not loading**: Check GridFS file IDs

---

## 🔧 Environment Variables Reference

### Backend (.env)
```env
# Required
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ananse
GEMINI_API_KEY=AIza...
FRONTEND_URL=https://your-frontend.vercel.app

# Optional
IMAGE_PROVIDER=gemini-image
GEMINI_MODEL=gemini-2.5-flash
MAX_FILE_SIZE=10485760

# Future (for audio TTS)
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_WS_URL=wss://your-backend.onrender.com
```

---

## 📊 Database Collections

### stories
- User-generated narratives
- Includes text/audio/image content
- Visual panels with images
- Audio narration
- Status tracking (pending/processing/complete/failed)

### chatrooms
- Anonymous chat room data
- 2 participants per room
- Active status tracking

### chatmessages
- Message history
- Sender ID, room ID, timestamp
- Text content (max 2000 chars)

### prompttemplates
- AI prompt guides
- Different templates per input type
- Default template system

### artisticstyles
- Visual style presets
- Prompt modifiers for AI
- User preference mapping

### audiostyles
- Audio narration settings
- Voice configurations
- TTS parameters

---

## 🔐 Security Checklist

- [x] Environment variables secured
- [x] No API keys in code
- [x] CORS configured for specific origins
- [x] Helmet.js security headers
- [x] Input validation on all endpoints
- [x] File upload size limits
- [x] Anonymous user IDs (no PII)
- [ ] Rate limiting (add in production)
- [ ] HTTPS/WSS enforced
- [ ] MongoDB IP whitelist
- [ ] Error messages sanitized

---

## 📈 Monitoring & Maintenance

### Recommended Tools:
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Logs**: Render logs, Winston
- **Performance**: New Relic, DataDog
- **Database**: MongoDB Atlas monitoring

### Regular Tasks:
- Monitor MongoDB storage usage
- Check API quota usage (Gemini)
- Review error logs weekly
- Backup database monthly
- Update dependencies quarterly

---

## 🎨 Customization Guide

### Change AI Model:
```javascript
// backend/services/geminiService.js
this.model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro' // or gemini-2.5-flash
});
```

### Change Image Provider:
```env
# .env
IMAGE_PROVIDER=stability  # or gemini-image or imagen
STABILITY_API_KEY=your_key
```

### Adjust Panel Count:
```javascript
// frontend/context/PreferencesContext.js
getPanelCount: () => {
  const pacing = preferences?.pacing;
  return pacing === 'fast' ? 3 : pacing === 'slow' ? 7 : 5;
}
```

### Add New Preferences:
1. Add to Quiz.js questions
2. Update PreferencesContext mapping
3. Integrate into geminiService prompt assembly

---

## 🐛 Troubleshooting

### Stories Stuck in "Processing"
```bash
# Check backend logs
cd ananse_ntentan_backend
node scripts/checkData.js
```

### WebSocket Not Connecting
- Verify backend is running
- Check browser console for errors
- Ensure WSS protocol in production
- Check firewall/proxy settings

### Images Not Loading
- Verify GridFS files exist in MongoDB
- Check file IDs in stories collection
- Test file endpoint: `/api/files/image/:id`

### High Memory Usage
- Reduce panel count
- Implement image compression
- Use CDN for file delivery
- Scale horizontally

---

## 📞 Support & Contact

**GitHub Issues**: [github.com/YOUR_USERNAME/ananse-ntentan/issues](https://github.com)
**Documentation**: See FRONTEND_FEATURES.md and BACKEND_FEATURES.md

---

## 📄 License

[Specify your license - MIT, Apache 2.0, etc.]

---

## 🙏 Acknowledgments

- **Google Gemini AI**: Multimodal AI capabilities
- **React Community**: Frontend framework
- **MongoDB Atlas**: Cloud database
- **Express.js**: Backend framework
- **Open Source Community**: Various dependencies

---

**Last Updated**: February 2026
**Version**: 1.0.0

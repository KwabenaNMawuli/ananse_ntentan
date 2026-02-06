# Ananse Ntentan - AI-Powered Storytelling Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

**Transform your ideas into visual stories with AI**

[Live Demo](#) · [Report Bug](https://github.com/YOUR_USERNAME/ananse-ntentan/issues) · [Request Feature](https://github.com/YOUR_USERNAME/ananse-ntentan/issues)

</div>

---

## 🌟 Overview

**Ananse Ntentan** is an innovative AI-powered platform that democratizes storytelling by transforming raw ideas—whether text, voice, or images—into fully realized visual narratives. No artistic skills required, just your imagination.

---

## ✨ Features

### 📝 Multi-Modal Story Creation
Transform your ideas into visual stories using three different input methods:

- **Write Mode**: Type your story idea (up to 5000 characters) and watch AI transform it into a multi-panel visual narrative with generated artwork for each scene
- **Speak Mode**: Record your voice (up to 60 seconds) - AI transcribes your speech and converts it into a visual story with dialogue and scenes
- **Sketch Mode**: Upload an image and AI analyzes it, understands the visual content, and creates a narrative story inspired by what it sees

Each story is automatically broken into 3-7 comic-style panels with AI-generated images and optional audio narration.

### 🎨 Personalized AI Experience
Your preferences shape every story:

- **Preference Quiz**: First-time users take a 5-question quiz covering genre (sci-fi, fantasy, horror, etc.), mood (dark, bright, mysterious), art style (comic book, manga, watercolor), pacing (fast/moderate/slow), and tone (serious, humorous, dramatic)
- **Smart AI Adaptation**: Your preferences automatically modify how AI generates stories - genre adds thematic elements, mood affects visual atmosphere, art style changes the illustration approach, pacing controls panel count (3/5/7 panels), and tone influences narrative voice
- **Recalibration**: Change your preferences anytime in Settings to get different creative outputs

### 💬 Anonymous Chat System
Connect with other storytellers without revealing your identity:

- **Random Matching**: Click "Find Random Wanderer" to be paired with another user currently online - perfect for discussing stories or getting creative inspiration
- **Real-Time Messaging**: WebSocket-powered instant messaging with typing indicators and message delivery confirmation
- **Chat History**: View and rejoin past conversations - all messages are saved and accessible from your chat lobby
- **Anonymous IDs**: Each user gets a unique `void_[timestamp]_[random]` identifier - no signup, no personal data, just pure creative connection

### 📚 Community Story Feed
Explore stories created by the community:

- **Curated Display**: Browse 2 stories at a time with full vertical panel layouts - see every panel of each story without clicking through
- **Pagination Controls**: Navigate between story pairs with Previous/Next buttons - smooth scrolling and lazy loading for optimal performance
- **Interactive Elements**: Like stories to show appreciation (like counts are visible), play audio narration if available, and view original submission type (text/audio/image)
- **Visual Experience**: All panels display vertically like reading a comic book - each panel shows AI-generated artwork, character dialogue, and scene descriptions

### ⚙️ Settings & Preferences
Full control over your experience:

- **View Preferences**: See your current settings displayed in an organized grid with visual icons for each category
- **Recalibrate**: Retake the preference quiz anytime to adjust how AI generates your stories
- **Reset Options**: Clear all preferences and start fresh if you want to experiment with different creative directions
- **Anonymous ID**: View your unique anonymous identifier used across the platform for chat and story submissions

### 🎯 Smart Loading & Status Tracking
Never wonder what's happening:

- **Progress Indicators**: Visual loading screens show percentage completion (0-100%) and current status ("Transmitting...", "Generating story...", "Creating images...")
- **Real-Time Updates**: Backend processes stories asynchronously - frontend polls every 2 seconds to check completion status
- **Auto-Display**: When your story finishes generating, it automatically appears in a full-screen overlay with all panels, audio, and action buttons
- **Error Handling**: Clear error messages if something goes wrong, with suggestions to check the Archive or retry submission

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ananse-ntentan.git
cd ananse-ntentan
```

2. **Install backend dependencies**
```bash
cd ananse_ntentan_backend
npm install
```

3. **Configure backend environment**
```bash
cp .env.example .env
# Edit .env with your credentials:
# MONGODB_URI=your_mongodb_connection_string
# GEMINI_API_KEY=your_gemini_api_key
```

4. **Seed the database**
```bash
npm run seed:prompts
```

5. **Start backend server**
```bash
npm start
# Server runs on http://localhost:5000
```

6. **Install frontend dependencies** (new terminal)
```bash
cd ../ananse_ntentan_frontend
npm install
```

7. **Configure frontend environment**
```bash
cp .env.local.example .env.local
# Edit .env.local:
# REACT_APP_API_URL=http://localhost:5000
# REACT_APP_WS_URL=ws://localhost:5000
```

8. **Start frontend**
```bash
npm start
# App opens at http://localhost:3000
```

9. **Start creating!** 🎉
   - Complete the preference quiz
   - Choose your input method (write/speak/sketch)
   - Watch AI transform your idea into a visual story

---

## 📖 Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Frontend Features](./FRONTEND_FEATURES.md)** - Complete frontend documentation
- **[Backend Features](./BACKEND_FEATURES.md)** - Complete backend documentation
- **[Architecture](./DEPLOYMENT_GUIDE.md#-system-architecture)** - System design overview

---

## 🏗️ Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Context API** - State management
- **Web Audio API** - Voice recording
- **WebSocket** - Real-time chat

### Backend
- **Node.js/Express** - Server framework
- **MongoDB** - Database (Atlas)
- **Mongoose** - ODM
- **GridFS** - File storage
- **WebSocket (ws)** - Real-time messaging

### AI & Media
- **Google Gemini API** - Multimodal AI (story generation, transcription, image analysis)
- **Gemini Image / Stability AI** - Image generation
- **Google Cloud TTS** - Audio narration (optional)
- **FFmpeg** - Video assembly (optional)

---

## 🎯 How It Works

```
User Input (Text/Voice/Image)
          ↓
   Gemini AI Analysis
          ↓
   Story Structure Generation
          ↓
   Panel-by-Panel Creation
          ↓
   Image Generation (per panel)
          ↓
   Audio Narration (optional)
          ↓
   Story Complete!
```

### Example Flow

1. **User writes**: "A lone astronaut discovers a mysterious signal on Mars"
2. **AI generates**: 5-panel story structure with dialogue and scene descriptions
3. **Images created**: Each panel visualized based on user's art style preference
4. **Audio narration**: Optional TTS voiceover generated
5. **Story displayed**: User sees completed story, can share to feed

---

## 🎨 User Experience

### First Visit
1. Generate anonymous ID automatically
2. Take 5-question preference quiz
3. Preferences saved to localStorage

### Creating Stories
1. Choose input method (write/speak/sketch)
2. Provide your content
3. AI processes (30-90 seconds)
4. View completed story with panels + audio

### Browsing Feed
1. See 2 stories at a time
2. All panels displayed vertically
3. Like stories
4. Listen to audio narration

### Chatting
1. Find random chat partner
2. Real-time anonymous messaging
3. View past conversations

---

## 🔐 Security & Privacy

- ✅ **No PII collected** - Fully anonymous
- ✅ **Secure WebSocket** - WSS in production
- ✅ **Input validation** - All endpoints protected
- ✅ **File size limits** - 10MB max uploads
- ✅ **Environment variables** - Secrets secured
- ✅ **CORS configured** - Restricted origins

---

## 🚀 Deployment

### Recommended Platforms

**Backend**: Render, Railway, Heroku
**Frontend**: Vercel, Netlify, Cloudflare Pages
**Database**: MongoDB Atlas

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed instructions.

---

## 📊 Project Statistics

- **Lines of Code**: ~15,000+
- **Components**: 10+ React components
- **API Endpoints**: 15+ REST routes
- **WebSocket Events**: 7 event types
- **Database Models**: 6 collections
- **AI Services**: 4 integrated services

---

## 🛣️ Roadmap

### Version 1.0 (Current) ✅
- [x] Multi-modal story creation
- [x] Personalization quiz
- [x] Story feed with pagination
- [x] Anonymous chat system
- [x] Preference management
- [x] Audio narration

### Version 1.1 (Planned)
- [ ] Story editing/remixing
- [ ] Collections and favorites
- [ ] Search and filter
- [ ] Social sharing
- [ ] Advanced matching algorithms
- [ ] Multiple languages

### Version 2.0 (Future)
- [ ] Video story export
- [ ] Mobile apps (iOS/Android)
- [ ] Collaborative storytelling
- [ ] Story competitions
- [ ] Premium features
- [ ] Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test thoroughly before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini Team** - For powerful multimodal AI
- **React Community** - For excellent documentation
- **MongoDB** - For reliable cloud database
- **Open Source Community** - For countless tools and libraries

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/YOUR_USERNAME/ananse-ntentan/issues)
- **Email**: your.email@example.com
- **Twitter**: [@your_handle](https://twitter.com/your_handle)

---

## 🌐 Links

- **Live Demo**: https://ananse-ntentan.vercel.app
- **API Documentation**: See [BACKEND_FEATURES.md](./BACKEND_FEATURES.md)
- **Frontend Docs**: See [FRONTEND_FEATURES.md](./FRONTEND_FEATURES.md)
- **Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

<div align="center">

**Made with ❤️ and AI**

*Empowering storytellers worldwide*

</div>

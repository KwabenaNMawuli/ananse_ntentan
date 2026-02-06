# Ananse Ntentan - Frontend Features Documentation

## Overview
The frontend is built with **React 18** and provides an immersive, cyberpunk-themed storytelling platform where users transmit their ideas (text, voice, or images) and receive AI-generated visual narratives.

---

## Core Features

### 1. **Multi-Modal Story Creation (HomePage.js)**
**Status**: ✅ Fully Implemented

**Three Input Methods**:
- **Write**: Text-based story input with real-time character counter
- **Speak**: Voice recording with live waveform visualization
  - Uses Web Audio API for microphone access
  - Real-time audio recording with visual feedback
  - Maximum 60-second recording duration
- **Sketch**: Image upload with drag-and-drop support
  - Accepts image files (PNG, JPG, JPEG, GIF, WEBP)
  - Image preview before submission

**Features**:
- Real-time validation and error handling
- Loading screen with progress tracking
- Automatic story display after generation
- Integration with user preferences for personalized AI generation

---

### 2. **Personalization System (Quiz.js + PreferencesContext)**
**Status**: ✅ Fully Implemented

**5-Step Preference Quiz**:
1. **Genre**: Sci-Fi, Fantasy, Horror, Romance, Adventure, Mystery
2. **Mood**: Dark, Bright, Mysterious, Intense, Calm
3. **Art Style**: Comic Book, Manga, Watercolor, Oil Painting, Digital Art, Sketch
4. **Pacing**: Fast (3 panels), Moderate (5 panels), Slow (7 panels)
5. **Tone**: Serious, Humorous, Dramatic, Whimsical, Noir

**Features**:
- Required before accessing main features
- Skip option available
- Back navigation between questions
- Progress bar visualization
- Preferences stored in localStorage
- Can recalibrate in Settings

**AI Integration**:
- Maps preferences to prompt modifiers for AI generation
- Controls panel count (3, 5, or 7 panels)
- Personalizes visual style and narrative tone

---

### 3. **Story Feed (Feed.js)**
**Status**: ✅ Fully Implemented

**Display Features**:
- Shows 2 stories per page
- Vertical panel display (all panels visible at once)
- Pagination controls (Previous/Next pair)
- Lazy loading for performance
- Auto-scroll to top on page change

**Story Cards**:
- Story ID badge
- Submission type indicator (TEXT/AUDIO/IMAGE)
- All visual panels displayed vertically
- Panel counter for each image
- Audio narration player (if available)
- Like functionality with visual feedback
- Image error handling with fallback placeholders

**Navigation**:
- Smooth transitions between story pairs
- "Return to Home" link
- Infinite scroll preparation (backend supports pagination)

---

### 4. **Anonymous Chat System (Chat.js)**
**Status**: ✅ Fully Implemented

**Core Features**:
- Real-time WebSocket-based messaging
- Anonymous user identification (void_[timestamp]_[random])
- Connection status indicator

**Lobby View**:
- Display anonymous user ID
- "Find Random Wanderer" matching button
- View past transmissions/chat history
- Connection status visualization

**Chat Room**:
- Real-time message display
- Message timestamps
- Own vs. other user message styling
- Auto-scroll to latest messages
- Leave room functionality
- System notifications (connection/disconnection)

**Features**:
- Message history persistence
- Reconnection handling
- Typing indicator ready
- Room list with last message preview

---

### 5. **User Preferences & Settings (Settings.js)**
**Status**: ✅ Fully Implemented

**Features**:
- Display all user preferences in a grid
- Recalibrate button (retake quiz)
- Reset preferences with confirmation
- Visual preference cards with icons
- Completion timestamp display
- Anonymous user ID display

**Preference Categories**:
- Story Preferences (genre, mood, pacing, tone)
- Visual Preferences (art style)
- Account Info (anonymous ID, join date)

---

### 6. **Story Display & Results**
**Status**: ✅ Fully Implemented

**Features**:
- Full-screen overlay for generated stories
- Story metadata (ID, type badge)
- All panels displayed vertically
- Panel dialogue/description text
- Audio narration player (if available)
- Action buttons:
  - Create another transmission
  - View archive

**Loading Experience**:
- Animated loading spinner
- Progress percentage (0-100%)
- Status messages ("Transmitting...", "Generating panels...", etc.)
- Polling mechanism (checks every 2 seconds)
- 2-minute timeout with fallback

---

### 7. **About Page (About.js)**
**Status**: ✅ Fully Implemented

**Content Sections**:
- Vision statement
- AI-enhanced narrative explanation
- Purpose and values
- Future roadmap
- Interactive stats display

**Features**:
- Sectioned content with clear hierarchy
- Bullet-point feature list
- Call-to-action closing
- Responsive design
- Glassmorphism effects

---

### 8. **Navigation & Routing (App.js, Navbar.js)**
**Status**: ✅ Fully Implemented

**Routes**:
- `/` - Home (Create transmission)
- `/archive` - Story feed
- `/chat` - Anonymous chat (labeled "VIBE")
- `/about` - About page
- `/settings` - User settings
- `/profile` - User profile (placeholder)
- `/quiz` - Preference calibration

**Protected Routes**:
- All routes except `/about` and `/quiz` require quiz completion
- Automatic redirect to quiz if not completed
- Loading state during preference check

**Navbar Features**:
- Persistent across all pages
- Icon-based navigation for settings/profile
- Active link styling
- Responsive design

---

### 9. **User Profile (UserProfile.js)**
**Status**: 🚧 Placeholder (Mock Data)

**Current Features**:
- Static profile display
- Mock transmission history
- Achievement badges
- Statistics dashboard

**Planned Enhancements**:
- Connect to real user data
- Editable profile fields
- Transmission history from backend
- Achievement system

---

## Technical Implementation

### State Management
- **Context API**: PreferencesContext for global user preferences
- **React Hooks**: useState, useEffect, useRef
- **localStorage**: Persistent preference storage

### API Integration
- Base URL configuration via environment variables
- RESTful endpoints for story CRUD operations
- WebSocket connection for real-time chat
- Multipart form data for file uploads

### Styling
- **Theme**: Cyberpunk/dark with cyan accents (#00ffff)
- **Effects**: Glassmorphism, glow effects, smooth animations
- **Responsive**: Mobile-first design
- **Fonts**: 'Cinzel' for headers, system fonts for body

### Performance Optimizations
- Lazy loading for images
- Pagination (2 stories at a time)
- Efficient re-renders with React keys
- Debounced like actions
- WebSocket connection reuse

---

## User Experience Flow

1. **First Visit**:
   - Anonymous ID generated automatically
   - Redirected to 5-question preference quiz
   - Preferences saved to localStorage

2. **Story Creation**:
   - Choose input method (write/speak/sketch)
   - Preferences automatically applied to AI generation
   - Real-time loading feedback
   - Automatic story display on completion

3. **Story Viewing**:
   - All panels visible vertically
   - Audio narration playback
   - Like functionality
   - Navigate between story pairs

4. **Chat Experience**:
   - Find random chat partner
   - Real-time messaging
   - View past conversations
   - Anonymous interaction

5. **Settings Management**:
   - View current preferences
   - Recalibrate (retake quiz)
   - Reset preferences

---

## Environment Variables

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

---

## Dependencies

**Core**:
- react: ^18.x
- react-dom: ^18.x
- react-router-dom: ^6.x

**Features**:
- Web Audio API (browser native)
- WebSocket (browser native)
- Fetch API (browser native)

---

## Browser Compatibility

**Minimum Requirements**:
- Modern browsers with ES6+ support
- WebSocket support
- MediaRecorder API (for voice recording)
- localStorage support

**Tested On**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## Known Issues & Limitations

1. **Voice Recording**: Requires HTTPS in production (browser security)
2. **WebSocket**: Requires secure WebSocket (wss://) in production
3. **File Upload**: 10MB size limit per file
4. **Audio Recording**: Maximum 60 seconds
5. **Story Generation**: 2-minute polling timeout

---

## Future Enhancements

- [ ] Real user authentication (optional)
- [ ] Share stories to social media
- [ ] Story editing/remixing
- [ ] Collections/favorites
- [ ] Search and filter functionality
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements (ARIA labels)
- [ ] PWA support (offline mode)
- [ ] Mobile app versions

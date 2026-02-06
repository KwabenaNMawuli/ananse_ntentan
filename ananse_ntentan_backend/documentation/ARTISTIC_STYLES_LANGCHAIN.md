# Artistic Styles & LangChain Integration

## 🎨 Overview

Adding **artistic style selection** and **LangChain** to enhance story generation without adding RAG complexity.

---

## 🎯 The Enhancement Concept

### What Users Want:
Users can choose or explore different **artistic styles** for their comic narratives:
- 🌃 **Cyberpunk Neon** - High-tech dystopia, neon colors, urban chaos
- 🖤 **Noir Graphic Novel** - Black & white, dramatic shadows, mystery
- 🎌 **Manga Style** - Japanese comic aesthetic, dynamic panels
- 🌈 **Pop Art Comic** - Bold colors, Ben-Day dots, vintage superhero
- 🎭 **Surrealist** - Dreamlike, abstract, symbolic
- 📚 **Classic Comic Strip** - Traditional newspaper comic style
- 🌌 **Space Opera** - Sci-fi cosmic, alien worlds
- 🏰 **Fantasy Epic** - Medieval, magical, heroic

### Why This is Brilliant:
1. ✅ **No RAG complexity** - Just different prompt templates
2. ✅ **Creative variety** - Same story, different artistic interpretations
3. ✅ **User engagement** - Let users explore styles
4. ✅ **Reusability** - Users could regenerate stories in new styles
5. ✅ **Learning opportunity** - Use LangChain skills you've learned!

---

## 🔧 LangChain Integration (Non-RAG Features)

### Why LangChain? ✅ Perfect Fit!

LangChain offers **many features beyond RAG** that perfectly suit your needs:

#### 1. **Prompt Template Management** ⭐
```python
from langchain.prompts import PromptTemplate, FewShotPromptTemplate

# Define reusable prompt templates
cyberpunk_template = PromptTemplate(
    input_variables=["story_content", "story_type"],
    template="""
    Transform this {story_type} story into a cyberpunk comic narrative:
    
    Story: {story_content}
    
    Style Guidelines:
    - High-tech dystopian setting
    - Neon-lit urban environments
    - Cybernetic enhancements
    - Corporate conspiracies
    - Rain-slicked streets
    
    Generate a 3-5 panel comic with:
    - Scene descriptions (visual style, lighting, mood)
    - Character dialogue
    - Narrative captions
    
    Output as JSON.
    """
)
```

**Benefit**: Much cleaner than managing template strings manually!

#### 2. **Chains for Multi-Step Processing** ⭐
```python
from langchain.chains import SequentialChain, LLMChain

# Step 1: Transcribe/Extract content
extraction_chain = LLMChain(
    llm=gemini_llm,
    prompt=extraction_prompt,
    output_key="extracted_content"
)

# Step 2: Apply artistic style
style_chain = LLMChain(
    llm=gemini_llm,
    prompt=style_prompt,
    output_key="styled_narrative"
)

# Step 3: Structure into panels
panel_chain = LLMChain(
    llm=gemini_llm,
    prompt=panel_prompt,
    output_key="comic_panels"
)

# Combine into sequential pipeline
story_generation_chain = SequentialChain(
    chains=[extraction_chain, style_chain, panel_chain],
    input_variables=["audio_file", "style_choice"],
    output_variables=["comic_panels"]
)
```

**Benefit**: Clean pipeline, easy to debug, modular!

#### 3. **Output Parsers** ⭐
```python
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class ComicPanel(BaseModel):
    panel_number: int = Field(description="Panel sequence number")
    scene_description: str = Field(description="Visual description")
    dialogue: str = Field(description="Character dialogue")
    narration: str = Field(description="Caption text")

class ComicStory(BaseModel):
    title: str = Field(description="Story title")
    narrative: str = Field(description="Overall narrative")
    panels: list[ComicPanel] = Field(description="Comic panels")
    style: str = Field(description="Artistic style used")

parser = PydanticOutputParser(pydantic_object=ComicStory)

# LangChain automatically validates and parses LLM output
result = parser.parse(gemini_response)
```

**Benefit**: Automatic validation, type safety, no manual JSON parsing!

#### 4. **Retry Logic & Error Handling** ⭐
```python
from langchain.callbacks import RetryCallbackHandler

# Automatic retries on API failures
chain = LLMChain(
    llm=gemini_llm,
    prompt=prompt,
    callbacks=[RetryCallbackHandler(max_retries=3)]
)
```

#### 5. **Few-Shot Learning** ⭐
```python
from langchain.prompts import FewShotPromptTemplate

examples = [
    {
        "input": "A person walking home at night",
        "output": '''
        Panel 1: Wide shot - Rain-slicked street, neon signs reflecting in puddles
        Panel 2: Close-up - Character's face illuminated by phone screen
        Panel 3: POV shot - Dark alley entrance ahead
        '''
    },
    # More examples...
]

few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_template,
    suffix="Now transform this story: {input}",
    input_variables=["input"]
)
```

**Benefit**: Teach Gemini the exact panel format you want!

---

## 📊 Updated Database Schema

### ArtisticStyle Model (NEW) ⭐

```javascript
{
  _id: ObjectId,
  name: "Cyberpunk Neon",
  slug: "cyberpunk-neon",
  description: "High-tech dystopia with neon-lit urban environments",
  
  visualCharacteristics: {
    color_palette: ["neon pink", "electric blue", "dark grays"],
    lighting: "High contrast, neon glow, rain reflections",
    mood: "Dystopian, gritty, mysterious",
    influences: ["Blade Runner", "Akira", "Ghost in the Shell"]
  },
  
  promptModifiers: {
    scene_prefix: "In a neon-lit cyberpunk city,",
    visual_style: "rendered in high-contrast cyberpunk aesthetic",
    atmosphere: "rain-slicked streets, holographic ads, urban decay"
  },
  
  examplePanels: [
    {
      description: "Wide establishing shot of towering megastructures...",
      dialogue: "Another night in Neo-Tokyo...",
      style_notes: "Emphasize vertical architecture, neon signs"
    }
  ],
  
  popularity: 0,              // Track which styles are popular
  isActive: true,
  createdAt: Date
}
```

### Updated Story Model

```javascript
{
  _id: ObjectId,
  type: 'speak' | 'write' | 'sketch',
  
  // NEW: Style selection
  artisticStyle: {
    styleId: ObjectId,         // Reference to ArtisticStyle
    styleName: "Cyberpunk Neon",
    customModifiers: String    // Optional user tweaks
  },
  
  originalContent: String,
  fileId: GridFS_ID,
  
  aiNarrative: String,
  panels: [...],
  
  // NEW: Allow style variations
  variations: [
    {
      styleId: ObjectId,
      generatedAt: Date,
      narrative: String,
      panels: [...]
    }
  ],
  
  metadata: {
    createdAt: Date,
    views: Number,
    likes: Number,
    processingStatus: String
  }
}
```

---

## 🎨 Creative Library Options

### Option 1: Text-Based Style Database (RECOMMENDED) ✅

**No external APIs needed** - Just curated text descriptions:

```javascript
// Store in MongoDB
const artisticStyles = [
  {
    name: "Cyberpunk Neon",
    promptTemplate: `
      Visual Style: Cyberpunk comic aesthetic
      - High-contrast neon colors (pink, blue, purple)
      - Urban dystopia setting
      - Rain-slicked streets with reflections
      - Holographic advertisements
      - Towering megastructures
      - Characters wear tech-enhanced clothing
      - Moody, dramatic lighting
    `,
    examples: [...]
  },
  {
    name: "Noir Graphic Novel",
    promptTemplate: `
      Visual Style: Film noir graphic novel
      - High-contrast black and white
      - Dramatic shadows and silhouettes
      - 1940s-inspired aesthetic
      - Urban night scenes
      - Venetian blind lighting effects
      - Cigarette smoke and fog
      - Femme fatales and detectives
    `,
    examples: [...]
  },
  // ... more styles
]
```

**Advantages**:
- ✅ Free (no API costs)
- ✅ Fast (no external calls)
- ✅ Fully customizable
- ✅ Works perfectly with Gemini text prompts
- ✅ Easy to version and update

### Option 2: Reference Image URLs (Optional Enhancement)

Store URLs to reference images (for documentation, not generation):

```javascript
{
  name: "Manga Style",
  referenceImages: [
    "https://example.com/manga-panel-example-1.jpg",
    "https://example.com/manga-panel-example-2.jpg"
  ],
  // Users see these for inspiration (frontend display)
  // But generation still uses text prompts
}
```

### Option 3: Integration with Free AI Image Models (Future)

**Not for hackathon**, but future possibilities:

- **Stable Diffusion** (free, open-source)
- **DALL-E 3 via Bing** (limited free tier)
- **Midjourney** (paid, but high quality)

**Current Recommendation**: Stick with **text-based style descriptions** for hackathon. Gemini is excellent at understanding artistic styles from text descriptions!

---

## 🏗️ Updated Architecture with LangChain

### New Tech Stack Addition:

```
ADDED:
- langchain-google-genai (LangChain + Gemini integration)
- langchain-core (core LangChain functionality)
- pydantic v2 (data validation with LangChain)

NOT ADDED (avoiding complexity):
- langchain-community (has RAG/vector store stuff)
- chromadb, faiss, pinecone (vector databases)
```

### Installation:

```bash
npm install langchain @langchain/google-genai
# OR if using Python backend:
pip install langchain-google-genai langchain-core pydantic
```

---

## 🔄 Updated Story Generation Pipeline with LangChain

```
┌──────────────────────┐
│ User Submits Story   │
│ + Selects Style      │ ← NEW: Style selection
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ Save File to GridFS          │ (if audio/image)
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ LangChain Extraction Chain   │ ← LangChain Step 1
│ - Audio → Transcription      │
│ - Image → Description        │
│ - Text → Validation          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Retrieve Artistic Style      │ ← NEW: Get style from DB
│ from MongoDB                 │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ LangChain Style Chain        │ ← LangChain Step 2
│ - Inject style modifiers     │
│ - Apply visual guidelines    │
│ - Create styled prompt       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ LangChain Generation Chain   │ ← LangChain Step 3
│ - Generate comic narrative   │
│ - Structure panels           │
│ - Apply output parser        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Pydantic Validation          │ ← Automatic via LangChain
│ - Validate JSON structure    │
│ - Type checking              │
│ - Error handling             │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Save to MongoDB              │
│ - Story with style metadata  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Return to User & Add to Feed │
└──────────────────────────────┘
```

---

## 📡 Updated API Endpoints

### NEW Endpoints for Styles:

```
GET  /api/styles              - Get all available artistic styles
GET  /api/styles/:slug        - Get specific style details
POST /api/stories             - Submit story WITH style selection
PUT  /api/stories/:id/restyle - Regenerate story in new style
GET  /api/stories?style=slug  - Filter feed by artistic style
```

### Example API Requests:

```javascript
// Submit story with style selection
POST /api/stories
{
  type: "speak",
  audioFile: <binary>,
  artisticStyle: "cyberpunk-neon",  // NEW!
  customModifiers: "Add more rain"   // Optional
}

// Regenerate story in different style
PUT /api/stories/65abc123/restyle
{
  newStyle: "noir-graphic-novel"
}

// Get all styles for user to choose from
GET /api/styles
Response: [
  {
    slug: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    description: "High-tech dystopia...",
    previewPanels: [...]
  },
  // ... more styles
]
```

---

## 🎨 Frontend Integration (Style Selector)

### Updated HomePage Component:

```javascript
// HomePage.js - Add style selector

const [selectedStyle, setSelectedStyle] = useState('cyberpunk-neon');
const [availableStyles, setAvailableStyles] = useState([]);

useEffect(() => {
  // Fetch available styles on mount
  axios.get('/api/styles')
    .then(res => setAvailableStyles(res.data));
}, []);

// In the submission form:
<select 
  value={selectedStyle} 
  onChange={(e) => setSelectedStyle(e.target.value)}
  className="style-selector"
>
  {availableStyles.map(style => (
    <option key={style.slug} value={style.slug}>
      {style.name} - {style.description}
    </option>
  ))}
</select>

// Include in submission
const handleSubmit = () => {
  const formData = new FormData();
  formData.append('type', submissionType);
  formData.append('artisticStyle', selectedStyle);
  // ... rest of submission
};
```

### Feed Component Enhancement:

```javascript
// Feed.js - Show style badges

<div className="story-card">
  <div className="style-badge" style={{
    background: getStyleColor(story.artisticStyle.styleName)
  }}>
    {story.artisticStyle.styleName}
  </div>
  
  <h3>{story.title}</h3>
  {/* ... rest of story display */}
  
  {/* NEW: Restyle button */}
  <button onClick={() => handleRestyle(story._id)}>
    🎨 See in Different Style
  </button>
</div>
```

---

## 🎯 Sample Artistic Styles Database (Starter Set)

### Curated Style Collection:

```javascript
const starterStyles = [
  {
    name: "Cyberpunk Neon",
    slug: "cyberpunk-neon",
    description: "High-tech dystopia with neon-lit urban chaos",
    color_palette: ["#FF006E", "#0080FF", "#8B00FF", "#00FFFF"],
    mood: "Gritty, dystopian, mysterious",
    influences: ["Blade Runner", "Akira", "Cyberpunk 2077"]
  },
  
  {
    name: "Noir Graphic Novel",
    slug: "noir-graphic-novel",
    description: "Classic black & white detective aesthetic",
    color_palette: ["#000000", "#FFFFFF", "#808080"],
    mood: "Mysterious, dramatic, moody",
    influences: ["Sin City", "The Spirit", "Batman: Year One"]
  },
  
  {
    name: "Manga Style",
    slug: "manga-style",
    description: "Japanese comic art with dynamic action",
    color_palette: ["#FFFFFF", "#000000", "#FF0000", "#FFA500"],
    mood: "Dynamic, energetic, expressive",
    influences: ["One Piece", "Naruto", "Attack on Titan"]
  },
  
  {
    name: "Pop Art Comic",
    slug: "pop-art-comic",
    description: "Vintage superhero comic with bold colors",
    color_palette: ["#FF0000", "#FFFF00", "#0000FF", "#000000"],
    mood: "Bold, heroic, energetic",
    influences: ["Roy Lichtenstein", "Andy Warhol", "Marvel Silver Age"]
  },
  
  {
    name: "Surrealist Dreams",
    slug: "surrealist-dreams",
    description: "Dreamlike and symbolic storytelling",
    color_palette: ["#9B59B6", "#3498DB", "#E74C3C", "#F39C12"],
    mood: "Dreamlike, mysterious, abstract",
    influences: ["Salvador Dali", "Sandman", "Inception"]
  },
  
  {
    name: "Space Opera",
    slug: "space-opera",
    description: "Epic sci-fi cosmic adventures",
    color_palette: ["#000033", "#6600CC", "#00FFFF", "#FFFFFF"],
    mood: "Epic, cosmic, adventurous",
    influences: ["Star Wars", "Guardians of Galaxy", "Fifth Element"]
  },
  
  {
    name: "Fantasy Epic",
    slug: "fantasy-epic",
    description: "Medieval magical world with heroes",
    color_palette: ["#8B4513", "#228B22", "#FFD700", "#4169E1"],
    mood: "Heroic, magical, adventurous",
    influences: ["Lord of the Rings", "Game of Thrones", "D&D"]
  },
  
  {
    name: "Minimalist Line Art",
    slug: "minimalist-line-art",
    description: "Clean, simple, expressive line work",
    color_palette: ["#000000", "#FFFFFF"],
    mood: "Clean, modern, elegant",
    influences: ["xkcd", "The New Yorker", "Saul Steinberg"]
  }
];
```

---

## 💰 Does This Change Costs?

### NO! Still Free During Hackathon ✅

- LangChain is **free and open-source**
- Still using same Gemini API (hackathon credits)
- Artistic styles stored in MongoDB (no cost)
- No image generation (no DALL-E/Midjourney costs)
- No vector databases (no Pinecone costs)

**Additional Tokens**: ~100-200 extra tokens per generation for style descriptions
**Impact**: Negligible (Gemini has 2M token context!)

---

## 🚀 Implementation Priority

### Phase 1: Core Styles (Week 3-4) ⭐
- [ ] Create ArtisticStyle model
- [ ] Seed 5-8 starter styles
- [ ] Add style selector to frontend
- [ ] Update Story model with style field

### Phase 2: LangChain Integration (Week 4-5) ⭐
- [ ] Install LangChain + Gemini integration
- [ ] Create prompt templates with LangChain
- [ ] Build sequential chains for pipeline
- [ ] Add Pydantic output parsers
- [ ] Test with different styles

### Phase 3: Style Endpoints (Week 5-6)
- [ ] GET /api/styles
- [ ] POST /api/stories with style
- [ ] PUT /api/stories/:id/restyle
- [ ] Style filtering in feed

### Phase 4: Polish (Week 6-7)
- [ ] Style preview panels
- [ ] Popular styles tracking
- [ ] Style recommendations
- [ ] A/B testing different style prompts

---

## 🎯 Example: Full LangChain Pipeline (Python)

```python
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import SequentialChain, LLMChain
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

# Initialize Gemini LLM
gemini = ChatGoogleGenerativeAI(
    model="gemini-3-pro",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.9
)

# Define output structure
class ComicStory(BaseModel):
    title: str = Field(description="Story title")
    narrative: str = Field(description="Comic narrative")
    panels: list[dict] = Field(description="Panel descriptions")

# Parser
parser = PydanticOutputParser(pydantic_object=ComicStory)

# Get artistic style from DB
style = db.artistic_styles.find_one({"slug": "cyberpunk-neon"})

# Create prompt template
prompt = PromptTemplate(
    template="""
    Transform this story into a comic narrative.
    
    Story Type: {story_type}
    Content: {content}
    
    Artistic Style: {style_name}
    Visual Guidelines:
    {style_guidelines}
    
    {format_instructions}
    """,
    input_variables=["story_type", "content", "style_name", "style_guidelines"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

# Create chain
chain = LLMChain(llm=gemini, prompt=prompt)

# Execute
result = chain.run(
    story_type="speak",
    content=transcribed_audio,
    style_name=style['name'],
    style_guidelines=style['promptModifiers']
)

# Parse and validate
comic_story = parser.parse(result)

# Save to MongoDB
db.stories.insert_one({
    "type": "speak",
    "artisticStyle": {
        "styleId": style['_id'],
        "styleName": style['name']
    },
    "aiNarrative": comic_story.narrative,
    "panels": comic_story.panels,
    # ...
})
```

---

## 📊 Architecture Impact Summary

### ❌ What We're NOT Adding:
- Vector databases
- RAG retrieval systems
- Image generation APIs
- Complex ML models
- Heavy infrastructure

### ✅ What We ARE Adding:
- LangChain (prompt management, chains, parsers)
- ArtisticStyle database collection (MongoDB)
- Style selection UI component
- Restyle functionality
- Better structured prompts

### Complexity Change:
- **Before**: 30% complexity (simple prompt-based)
- **After**: 35% complexity (still simple, slightly more features)
- **Benefit**: HUGE creativity boost, professional prompt management

---

## 🎉 Why This is Brilliant

1. **Uses Your LangChain Knowledge** ✅
2. **No RAG Complexity** ✅
3. **Huge Creative Value** ✅
4. **Still Hackathon-Friendly** ✅
5. **Professional Architecture** ✅
6. **Easy to Expand Later** ✅

---

## 🚀 Recommendation

**YES! Implement this!** 

- LangChain is perfect for your use case (without RAG features)
- Artistic styles add massive value
- Complexity increase is minimal
- You'll use skills you've learned
- Makes platform much more engaging

**Start with**:
1. Add 3-5 artistic styles
2. Integrate LangChain for prompt management
3. Add style selector to frontend
4. Test different styles with same story

---

**Last Updated**: January 28, 2026
**Status**: Enhancement Proposed & Architected 🎨
**Recommendation**: IMPLEMENT ✅

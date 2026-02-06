# Google Gemini 3 Pro Integration Guide

## 🎯 Overview

This guide covers integrating Google Gemini 3 Pro (from hackathon access) into the Ananse Ntentan RAG system.

---

## 🌟 Why Gemini 3 Pro for This Project?

### Key Advantages

1. **Hackathon Credits** ⭐
   - Free/heavily discounted API access
   - Perfect for MVP development and testing
   - No upfront costs during development phase

2. **Massive Context Window** (2M tokens!)
   - Can process entire conversation histories
   - Perfect for RAG systems - more context = better outputs
   - Can include many retrieved transmissions in one prompt

3. **Native Multimodal Support**
   - Text, image, audio in ONE model
   - No need for separate Whisper (audio) or GPT-4V (images)
   - Simplifies architecture significantly

4. **Competitive Pricing (Post-Hackathon)**
   - Gemini 3 Pro: ~$0.0025/1K input, ~$0.01/1K output
   - Gemini 1.5 Flash: ~$0.00025/1K input, ~$0.001/1K output
   - More affordable than GPT-4 Turbo

5. **JSON Mode & Function Calling**
   - Structured outputs for comic panel generation
   - Reliable JSON formatting for your frontend
   - Function calling for tool use

---

## 🔧 Setup Instructions

### Step 1: Get Your Gemini API Key

From your hackathon access:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your hackathon account
3. Click "Get API Key"
4. Copy the key and add to `.env`:

```env
GEMINI_API_KEY=AIza...your_key_here
```

### Step 2: Install Google AI SDK

```bash
cd ananse_ntentan_backend
npm install @google/generative-ai
```

### Step 3: Basic Setup (server.js or config/gemini.js)

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get model instances
const geminiPro = genAI.getGenerativeModel({ 
  model: 'gemini-3-pro',
  generationConfig: {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH',
    },
  ],
});

const geminiFlash = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash-latest' 
});

const geminiEmbedding = genAI.getGenerativeModel({ 
  model: 'text-embedding-004' 
});

module.exports = { geminiPro, geminiFlash, geminiEmbedding };
```

---

## 💡 Implementation Examples

### Example 1: Text Generation (RAG Pipeline)

```javascript
const { geminiPro } = require('../config/gemini');

async function generateComicTransformation(userSubmission, retrievedContext) {
  try {
    // Construct RAG-augmented prompt
    const prompt = `
You are a creative AI for Ananse Ntentan, a cyberpunk storytelling platform.

CONTEXT FROM PAST TRANSMISSIONS:
${retrievedContext.map((ctx, i) => `
[Transmission ${i + 1}]
Type: ${ctx.type}
Content: ${ctx.content}
Theme: ${ctx.theme}
`).join('\n')}

NEW SUBMISSION:
Type: ${userSubmission.type}
Content: ${userSubmission.content}

TASK: Transform this submission into a 4-panel comic-style narrative.
Consider the themes and style from past transmissions to maintain continuity.

OUTPUT FORMAT (JSON):
{
  "panels": [
    {
      "number": 1,
      "scene": "Description of the visual scene",
      "dialogue": "Character dialogue or narration",
      "mood": "cyberpunk/dystopian/mystical/etc"
    },
    // ... 3 more panels
  ],
  "overallTheme": "Main theme connecting to past transmissions",
  "characters": ["List of characters mentioned"],
  "setting": "Description of the world/location"
}
`;

    const result = await geminiPro.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const comicData = JSON.parse(text);
    
    return comicData;
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}

module.exports = { generateComicTransformation };
```

### Example 2: Generate Embeddings

```javascript
const { geminiEmbedding } = require('../config/gemini');

async function generateEmbedding(text) {
  try {
    const result = await geminiEmbedding.embedContent({
      content: { parts: [{ text }] },
    });
    
    const embedding = result.embedding.values;
    
    return embedding; // Array of floats (768 dimensions)
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw error;
  }
}

// Batch embeddings for efficiency
async function batchGenerateEmbeddings(texts) {
  const embeddings = await Promise.all(
    texts.map(text => generateEmbedding(text))
  );
  
  return embeddings;
}

module.exports = { generateEmbedding, batchGenerateEmbeddings };
```

### Example 3: Multimodal - Audio Processing

```javascript
const { geminiPro } = require('../config/gemini');
const fs = require('fs');

async function processAudioSubmission(audioFilePath) {
  try {
    // Read audio file
    const audioData = fs.readFileSync(audioFilePath);
    const base64Audio = audioData.toString('base64');
    
    const prompt = "Transcribe this audio and extract its emotional tone, key themes, and narrative elements for a cyberpunk comic transformation.";
    
    const result = await geminiPro.generateContent([
      {
        inlineData: {
          mimeType: 'audio/mpeg', // or 'audio/wav'
          data: base64Audio,
        },
      },
      { text: prompt },
    ]);
    
    const response = await result.response;
    const analysis = response.text();
    
    return JSON.parse(analysis);
  } catch (error) {
    console.error('Audio processing error:', error);
    throw error;
  }
}

module.exports = { processAudioSubmission };
```

### Example 4: Multimodal - Image Understanding (Sketch)

```javascript
const { geminiPro } = require('../config/gemini');
const fs = require('fs');

async function analyzeSketch(imageFilePath) {
  try {
    // Read image file
    const imageData = fs.readFileSync(imageFilePath);
    const base64Image = imageData.toString('base64');
    
    const prompt = `
Analyze this sketch for a cyberpunk comic platform:
1. Describe what's drawn
2. Identify the mood and atmosphere
3. Extract character descriptions
4. Suggest a narrative that fits this art style
5. Connect it to cyberpunk themes

Return as JSON with keys: description, mood, characters, narrative, themes
`;
    
    const result = await geminiPro.generateContent([
      {
        inlineData: {
          mimeType: 'image/png', // or 'image/jpeg'
          data: base64Image,
        },
      },
      { text: prompt },
    ]);
    
    const response = await result.response;
    const analysis = response.text();
    
    return JSON.parse(analysis);
  } catch (error) {
    console.error('Image analysis error:', error);
    throw error;
  }
}

module.exports = { analyzeSketch };
```

### Example 5: Streaming Responses (Real-time Updates)

```javascript
const { geminiPro } = require('../config/gemini');

async function streamComicGeneration(prompt, onChunk) {
  try {
    const result = await geminiPro.generateContentStream(prompt);
    
    let fullText = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      
      // Send chunk to client via WebSocket
      onChunk(chunkText);
    }
    
    return fullText;
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
}

// Usage with WebSocket
async function handleStreamingGeneration(ws, userSubmission, context) {
  const prompt = buildRAGPrompt(userSubmission, context);
  
  await streamComicGeneration(prompt, (chunk) => {
    ws.send(JSON.stringify({
      type: 'generation_chunk',
      data: chunk,
    }));
  });
  
  ws.send(JSON.stringify({
    type: 'generation_complete',
  }));
}

module.exports = { streamComicGeneration, handleStreamingGeneration };
```

---

## 🎨 RAG Pipeline with Gemini

### Complete Flow

```javascript
const { geminiPro, geminiEmbedding } = require('../config/gemini');
const { searchSimilarTransmissions } = require('../services/vectorDB');
const Transmission = require('../models/Transmission');

async function processTransmissionWithRAG(userSubmission) {
  // 1. Generate embedding for new submission
  const submissionEmbedding = await geminiEmbedding.embedContent({
    content: { parts: [{ text: userSubmission.content }] },
  });
  
  // 2. Search for similar past transmissions
  const similarTransmissions = await searchSimilarTransmissions(
    submissionEmbedding.embedding.values,
    { topK: 5, threshold: 0.7 }
  );
  
  // 3. Fetch full transmission data
  const contextTransmissions = await Transmission.find({
    _id: { $in: similarTransmissions.map(s => s.id) }
  });
  
  // 4. Build augmented prompt
  const prompt = buildRAGPrompt(userSubmission, contextTransmissions);
  
  // 5. Generate with Gemini
  const result = await geminiPro.generateContent(prompt);
  const response = await result.response;
  const comicOutput = JSON.parse(response.text());
  
  // 6. Save transmission with embedding and context
  const newTransmission = new Transmission({
    userId: userSubmission.userId,
    type: userSubmission.type,
    content: userSubmission.content,
    embedding: submissionEmbedding.embedding.values,
    retrievedContext: similarTransmissions.map(s => s.id),
    generatedOutput: comicOutput,
    createdAt: new Date(),
  });
  
  await newTransmission.save();
  
  return {
    transmission: newTransmission,
    comicOutput,
    similarTransmissions: contextTransmissions,
  };
}

function buildRAGPrompt(submission, contextTransmissions) {
  return `
You are the AI engine for Ananse Ntentan, a cyberpunk storytelling platform.

RELEVANT PAST TRANSMISSIONS (for context and continuity):
${contextTransmissions.map((tx, i) => `
--- Transmission ${i + 1} ---
Type: ${tx.type}
Date: ${tx.createdAt.toLocaleDateString()}
Content: ${tx.content}
Themes: ${tx.generatedOutput?.overallTheme || 'N/A'}
---
`).join('\n')}

NEW TRANSMISSION TO TRANSFORM:
Type: ${submission.type}
Content: ${submission.content}

INSTRUCTIONS:
1. Analyze the new submission
2. Draw thematic connections to past transmissions above
3. Create a 4-panel cyberpunk comic narrative
4. Maintain world consistency (characters, settings, themes)
5. Add new creative elements while respecting established lore

OUTPUT AS JSON:
{
  "panels": [
    {"number": 1, "scene": "...", "dialogue": "...", "mood": "..."},
    {"number": 2, "scene": "...", "dialogue": "...", "mood": "..."},
    {"number": 3, "scene": "...", "dialogue": "...", "mood": "..."},
    {"number": 4, "scene": "...", "dialogue": "...", "mood": "..."}
  ],
  "overallTheme": "...",
  "characters": ["..."],
  "setting": "...",
  "connectionsToPast": "How this relates to previous transmissions"
}
`;
}

module.exports = { processTransmissionWithRAG };
```

---

## ⚡ Performance Optimization

### 1. Caching Strategy

```javascript
const NodeCache = require('node-cache');
const embeddingCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

async function getCachedEmbedding(text) {
  const cacheKey = require('crypto')
    .createHash('md5')
    .update(text)
    .digest('hex');
  
  let embedding = embeddingCache.get(cacheKey);
  
  if (!embedding) {
    embedding = await generateEmbedding(text);
    embeddingCache.set(cacheKey, embedding);
  }
  
  return embedding;
}
```

### 2. Batch Processing

```javascript
// Process multiple submissions efficiently
async function batchProcessTransmissions(submissions) {
  // Generate all embeddings in parallel
  const embeddings = await Promise.all(
    submissions.map(sub => generateEmbedding(sub.content))
  );
  
  // Process each with RAG (can also parallelize this)
  const results = await Promise.all(
    submissions.map((sub, i) => 
      processTransmissionWithRAG({ ...sub, embedding: embeddings[i] })
    )
  );
  
  return results;
}
```

### 3. Quota Management

```javascript
const quotaTracker = {
  requestsToday: 0,
  tokensUsedToday: 0,
  lastReset: new Date(),
};

function checkQuota() {
  // Reset daily counter
  if (new Date().getDate() !== quotaTracker.lastReset.getDate()) {
    quotaTracker.requestsToday = 0;
    quotaTracker.tokensUsedToday = 0;
    quotaTracker.lastReset = new Date();
  }
  
  const maxRequestsPerDay = parseInt(process.env.MAX_REQUESTS_PER_DAY);
  
  if (quotaTracker.requestsToday >= maxRequestsPerDay) {
    throw new Error('Daily quota exceeded. Try Gemini Flash or wait until tomorrow.');
  }
}

async function geminiWithQuotaTracking(prompt) {
  checkQuota();
  
  const result = await geminiPro.generateContent(prompt);
  
  quotaTracker.requestsToday++;
  quotaTracker.tokensUsedToday += result.response.usageMetadata?.totalTokenCount || 0;
  
  return result;
}
```

### 4. Fallback to Gemini Flash

```javascript
async function generateWithFallback(prompt, preferFlash = false) {
  try {
    const model = (preferFlash || quotaTracker.requestsToday > 8000) 
      ? geminiFlash 
      : geminiPro;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      console.log('Falling back to Gemini Flash...');
      const result = await geminiFlash.generateContent(prompt);
      return result.response.text();
    }
    throw error;
  }
}
```

---

## 🔍 Testing Your Integration

### Test Script (test-gemini.js)

```javascript
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeminiConnection() {
  console.log('🧪 Testing Gemini 3 Pro connection...\n');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro' });
    
    const prompt = `Transform this into a cyberpunk comic panel:
    "A lone figure walks through neon-lit streets, rain falling."
    
    Return JSON: {"scene": "...", "mood": "...", "dialogue": "..."}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ Success! Gemini response:');
    console.log(response);
    console.log('\n📊 Usage:', result.response.usageMetadata);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testEmbedding() {
  console.log('\n🧪 Testing Gemini embeddings...\n');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    const result = await model.embedContent({
      content: { parts: [{ text: 'Cyberpunk neon streets' }] },
    });
    
    console.log('✅ Embedding generated!');
    console.log('Dimensions:', result.embedding.values.length);
    console.log('First 10 values:', result.embedding.values.slice(0, 10));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGeminiConnection();
testEmbedding();
```

Run it:
```bash
node test-gemini.js
```

---

## 📊 Monitoring Usage

### Usage Dashboard Endpoint

```javascript
router.get('/api/admin/gemini-stats', async (req, res) => {
  res.json({
    requestsToday: quotaTracker.requestsToday,
    tokensUsedToday: quotaTracker.tokensUsedToday,
    quotaLimit: process.env.MAX_REQUESTS_PER_DAY,
    percentageUsed: (quotaTracker.requestsToday / process.env.MAX_REQUESTS_PER_DAY * 100).toFixed(2),
    lastReset: quotaTracker.lastReset,
  });
});
```

---

## 🚨 Error Handling

```javascript
async function safeGeminiCall(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await geminiPro.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      if (error.message.includes('quota')) {
        // Try Flash model
        return await geminiFlash.generateContent(prompt).then(r => r.response.text());
      }
      
      if (error.message.includes('rate limit')) {
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      
      if (i === retries - 1) throw error;
    }
  }
}
```

---

## 🎓 Best Practices

1. **Always use JSON mode** for structured outputs
2. **Cache embeddings** - they don't change for the same input
3. **Monitor quota usage** - implement alerts at 80% capacity
4. **Use streaming** for better UX on long generations
5. **Implement fallbacks** - Gemini Flash when Pro quota is low
6. **Batch when possible** - combine multiple operations
7. **Log token usage** - track costs even with hackathon credits

---

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini SDK for Node.js](https://github.com/google/generative-ai-js)
- [Gemini Pricing](https://ai.google.dev/pricing)

---

## 🎯 Next Steps

1. ✅ Get your Gemini API key from hackathon
2. ✅ Install `@google/generative-ai` package
3. ✅ Test connection with test script
4. ✅ Implement embedding generation
5. ✅ Set up vector database (Pinecone/Qdrant)
6. ✅ Build RAG pipeline
7. ✅ Add quota monitoring
8. ✅ Implement caching
9. ✅ Test end-to-end with frontend

---

**You're all set! With Gemini 3 Pro's massive context window and multimodal capabilities, your RAG system will be incredibly powerful!** 🚀

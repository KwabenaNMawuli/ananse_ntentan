require('dotenv').config();
const mongoose = require('mongoose');
const PromptTemplate = require('../models/PromptTemplate');

const templates = [
  {
    name: 'Write Story Generator v1',
    type: 'write',
    promptText: `You are a creative storytelling AI that transforms user stories into engaging comic-style narratives.

TASK: Convert the user's story into a structured comic narrative with 4-6 panels.

OUTPUT FORMAT (respond with valid JSON only):
{
  "panels": [
    {
      "number": 1,
      "scene": "Brief scene setting",
      "description": "Visual description of what's happening",
      "dialogue": "Character dialogue or narration"
    }
  ],
  "narration": "A complete audio-ready narration script that tells the full story in an engaging way, suitable for text-to-speech."
}

GUIDELINES:
- Create 4-6 engaging panels
- Each panel should have clear visual descriptions
- Include compelling dialogue or narration
- The narration should be conversational and engaging
- Focus on emotional impact and story flow
- Keep it concise but impactful`,
    guidelines: [
      'Generate 4-6 panels per story',
      'Include clear scene settings',
      'Write engaging dialogue',
      'Create a coherent narrative arc',
      'Make narration suitable for audio'
    ],
    styleParameters: {
      panelStructure: '4-6 panels',
      dialogueFormatting: 'Comic-style speech bubbles'
    },
    version: '1.0',
    isActive: true
  }
];

async function seedPrompts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing templates (optional - comment out if you want to keep existing)
    await PromptTemplate.deleteMany({});
    console.log('🗑️  Cleared existing prompt templates');

    // Insert new templates
    const result = await PromptTemplate.insertMany(templates);
    console.log(`✅ Created ${result.length} prompt template(s)`);

    result.forEach(template => {
      console.log(`   - ${template.name} (${template.type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding prompts:', error);
    process.exit(1);
  }
}

seedPrompts();

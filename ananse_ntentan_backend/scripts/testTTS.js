const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { HfInference } = require('@huggingface/inference');

async function testTTS() {
    console.log("Testing HUGGINGFACE Connection (Explicit Provider)...");
    const client = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    // 1. Test Basic Text Gen (GPT-2)
    try {
        console.log("Testing GPT-2 with provider 'hf-inference'...");
        await client.textGeneration({
            model: 'gpt2',
            inputs: 'Hello world',
            provider: 'hf-inference'
        });
        console.log("✅ GPT-2 is working");
    } catch (e) {
        console.error("❌ GPT-2 Failed:", e.message);
    }
}



testTTS();

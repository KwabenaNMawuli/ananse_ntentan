const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function testTTS(model) {
    console.log(`Testing model: ${model}...`);
    try {
        const response = await hf.textToSpeech({
            model: model,
            inputs: "This is a test of the emergency broadcast system."
        });
        console.log(`✅ Success with ${model}`);
        // Check if we actually got bytes
        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`   Received ${buffer.length} bytes.`);
        return true;
    } catch (error) {
        console.log(`❌ Failed with ${model}`);
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log("Checking API Key:", process.env.HUGGINGFACE_API_KEY ? "Present" : "Missing");
    
    // 1. The one currently failing
    await testTTS('coqui/XTTS-v2');
    
    // 2. Facebook MMS (Robust, free)
    await testTTS('facebook/mms-tts-eng');
    
    // 3. ESPnet (Lightweight)
    await testTTS('espnet/kan-bayashi_ljspeech_vits');
}

runTests();

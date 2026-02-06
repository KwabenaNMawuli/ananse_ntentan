const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testRouter() {
    console.log("Testing Router URL...");
    const token = process.env.HUGGINGFACE_API_KEY;
    // const model = 'gpt2';
    // const model = 'facebook/mms-tts-eng';
    // const model = 'microsoft/speecht5_tts';
    const model = 'gpt2'; // The desired one
    
    // Trying likely URL patterns
    const urls = [
        `https://router.huggingface.co/hf-inference/models/${model}`,
        `https://api-inference.huggingface.co/models/${model}` // Old one
    ];

    for (const url of urls) {
        console.log(`\nFetching: ${url}`);
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: "Ananse is a spider." })
            });
            
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                console.log("✅ Success!");
                const buff = await res.arrayBuffer();
                console.log("Bytes:", buff.byteLength);
                break;
            } else {
                console.log("Error Body:", await res.text());
            }
        } catch (e) {
            console.error("Fetch failed:", e.message);
        }
    }
}

testRouter();

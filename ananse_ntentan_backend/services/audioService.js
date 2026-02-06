const { HfInference } = require('@huggingface/inference');

class AudioService {
  constructor() {
    this.client = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  async generateAudio(script, audioStyle) {
    try {
      const model = process.env.TTS_MODEL || 'coqui/XTTS-v2';
      const response = await this.client.textToSpeech({
        model: model,
        inputs: script
      });
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Audio generation error:', error);
      throw error;
    }
  }

  async getDuration(audioBuffer) {
    // Simple estimate: MP3 at 128kbps ≈ 16KB per second
    const sizeInKB = audioBuffer.length / 1024;
    const estimatedDuration = Math.ceil((sizeInKB / 16) * 1000); // ms
    return estimatedDuration;
  }
}

module.exports = new AudioService();

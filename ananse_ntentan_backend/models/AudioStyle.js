const mongoose = require('mongoose');

const audioStyleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  voiceSettings: {
    voiceType: String, // Coqui TTS model name (e.g., 'coqui/XTTS-v2')
    speakingRate: { type: Number, default: 1.0 },
    pitch: { type: Number, default: 0.0 },
    volumeGain: { type: Number, default: 0.0 }
  },
  audioEffects: {
    backgroundMusic: String,
    ambientSounds: [String],
    processing: [String]
  },
  mood: String,
  exampleAudio: String,
  popularity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('AudioStyle', audioStyleSchema);

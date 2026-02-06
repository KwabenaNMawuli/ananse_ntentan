const mongoose = require('mongoose');

const artisticStyleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  characteristics: {
    colorPalette: [String],
    lighting: String,
    mood: String,
    artisticInfluence: String
  },
  promptModifiers: [String],
  examplePanels: [String],
  popularity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArtisticStyle', artisticStyleSchema);

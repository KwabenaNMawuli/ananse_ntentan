const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ArtisticStyle = require('../models/ArtisticStyle');
const AudioStyle = require('../models/AudioStyle');

const artisticStyles = [
  {
    name: 'Standard Comic',
    slug: 'default',
    description: 'A classic western comic book style with clear lines and vibrant colors.',
    characteristics: {
      colorPalette: ['Primary', 'Vibrant'],
      lighting: 'balanced',
      mood: 'Adventure',
      artisticInfluence: 'Marvel/DC'
    },
    promptModifiers: ['comic book style', 'vibrant colors', 'clear outlines', 'action shot'],
    popularity: 100
  },
  {
    name: 'Noir',
    slug: 'noir',
    description: 'Dark, moody, high contrast black and white style.',
    characteristics: {
      colorPalette: ['Black', 'White', 'Grey'],
      lighting: 'High Contrast',
      mood: 'Mystery',
      artisticInfluence: 'Film Noir'
    },
    promptModifiers: ['noir style', 'high contrast', 'black and white', 'dramatic shadows'],
    popularity: 50
  },
  {
    name: 'Watercolor',
    slug: 'watercolor',
    description: 'Soft, painterly style with bleeding colors.',
    characteristics: {
      colorPalette: ['Pastel', 'Soft'],
      lighting: 'Diffused',
      mood: 'Dreamy',
      artisticInfluence: 'Watercolor painting'
    },
    promptModifiers: ['watercolor painting', 'soft edges', 'dreamy atmosphere'],
    popularity: 60
  }
];

const audioStyles = [
  {
    name: 'Standard Narrator',
    slug: 'default',
    description: 'A clear, balanced voice suitable for general storytelling.',
    voiceSettings: {
      voiceType: 'coqui/XTTS-v2',
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGain: 0.0
    },
    mood: 'Neutral',
    popularity: 100
  },
  {
    name: 'Suspenseful',
    slug: 'suspense',
    description: 'Slow, deep voice for scary or tense stories.',
    voiceSettings: {
      voiceType: 'coqui/XTTS-v2',
      speakingRate: 0.8,
      pitch: -0.5,
      volumeGain: 0.0
    },
    mood: 'Tense',
    popularity: 40
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing
    await ArtisticStyle.deleteMany({});
    await AudioStyle.deleteMany({});
    console.log('Cleared existing styles.');

    // Seed
    await ArtisticStyle.insertMany(artisticStyles);
    await AudioStyle.insertMany(audioStyles);
    
    console.log('Seeded Artistic and Audio styles successfully.');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

seedDB();

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ArtisticStyle = require('../models/ArtisticStyle');
const AudioStyle = require('../models/AudioStyle');
const PromptTemplate = require('../models/PromptTemplate');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const artisticCount = await ArtisticStyle.countDocuments();
    const audioCount = await AudioStyle.countDocuments();
    const promptCount = await PromptTemplate.countDocuments();

    console.log(`Artistic Styles: ${artisticCount}`);
    console.log(`Audio Styles: ${audioCount}`);
    console.log(`Prompt Templates: ${promptCount}`);
    
    if (artisticCount > 0) {
        const s = await ArtisticStyle.findOne();
        console.log('Sample Artistic Style:', s);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();

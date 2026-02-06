const mongoose = require('mongoose');

const promptTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['speak', 'write', 'sketch'],
    required: true
  },
  promptText: { type: String, required: true },
  guidelines: [String],
  styleParameters: {
    panelStructure: String,
    dialogueFormatting: String
  },
  version: { type: String, default: '1.0' },
  isActive: { type: Boolean, default: true },
  metrics: {
    successRate: Number,
    avgGenerationTime: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PromptTemplate', promptTemplateSchema);

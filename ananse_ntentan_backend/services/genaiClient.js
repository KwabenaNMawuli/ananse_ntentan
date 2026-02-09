/**
 * Google GenAI Client
 * Centralized client for the @google/genai SDK
 * 
 * This replaces the legacy @google/generative-ai package.
 * Supports: thinking_level, thought_signature, function calling, multimodal inputs
 */

const { GoogleGenAI } = require('@google/genai');

// Initialize the client with your API key
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

module.exports = client;

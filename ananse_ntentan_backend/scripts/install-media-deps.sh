#!/bin/bash

# Ananse Ntentan - Image & Video Features Installation Script
# This script installs the required dependencies for media generation

echo "🎨 Installing Image & Video Generation Dependencies"
echo "===================================================="
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

# Navigate to backend directory
cd "$(dirname "$0")/.." || exit

echo ""
echo "📦 Installing npm dependencies..."
npm install axios fluent-ffmpeg sharp

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check FFmpeg
echo "🔍 Checking for FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    ffmpeg_version=$(ffmpeg -version | head -n 1)
    echo "✅ FFmpeg found: $ffmpeg_version"
else
    echo "❌ FFmpeg not found!"
    echo ""
    echo "📦 Please install FFmpeg:"
    echo ""
    echo "macOS:"
    echo "  brew install ffmpeg"
    echo ""
    echo "Linux (Ubuntu/Debian):"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install ffmpeg"
    echo ""
    echo "Windows:"
    echo "  1. Download from https://ffmpeg.org/download.html"
    echo "  2. Extract to C:\\ffmpeg"
    echo "  3. Add C:\\ffmpeg\\bin to PATH"
    echo "  4. Restart terminal/VS Code"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Configure your .env file with API keys"
echo "2. Run: node scripts/setup-media-features.js"
echo "3. Test with: node scripts/testImageService.js"
echo "4. Start your server: npm start"
echo ""
echo "📖 Documentation:"
echo "- Quick Start: documentation/MEDIA_FEATURES_QUICKSTART.md"
echo "- Full Guide: documentation/IMAGE_VIDEO_INTEGRATION.md"
echo "- Summary: documentation/IMPLEMENTATION_SUMMARY.md"
echo ""

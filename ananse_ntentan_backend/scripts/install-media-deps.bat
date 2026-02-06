@echo off
REM Ananse Ntentan - Image & Video Features Installation Script
REM This script installs the required dependencies for media generation

echo ======================================================
echo 🎨 Installing Image ^& Video Generation Dependencies
echo ======================================================
echo.

REM Check Node.js version
echo 📋 Checking Node.js version...
node -v
echo.

REM Navigate to backend directory
cd /d "%~dp0\.."

echo 📦 Installing npm dependencies...
call npm install axios fluent-ffmpeg sharp

echo.
echo ✅ Dependencies installed!
echo.

REM Check FFmpeg
echo 🔍 Checking for FFmpeg...
where ffmpeg >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ FFmpeg found!
    ffmpeg -version | findstr "ffmpeg version"
) else (
    echo ❌ FFmpeg not found!
    echo.
    echo 📦 Please install FFmpeg:
    echo.
    echo Windows Installation:
    echo   1. Download from https://ffmpeg.org/download.html
    echo   2. Extract to C:\ffmpeg
    echo   3. Add C:\ffmpeg\bin to your PATH environment variable
    echo   4. Restart your terminal/VS Code
    echo.
    echo To add to PATH:
    echo   - Open System Properties ^> Environment Variables
    echo   - Edit "Path" under System variables
    echo   - Add: C:\ffmpeg\bin
    echo   - Click OK and restart terminal
)

echo.
echo 🎯 Next Steps:
echo 1. Configure your .env file with API keys
echo 2. Run: node scripts\setup-media-features.js
echo 3. Test with: node scripts\testImageService.js
echo 4. Start your server: npm start
echo.
echo 📖 Documentation:
echo - Quick Start: documentation\MEDIA_FEATURES_QUICKSTART.md
echo - Full Guide: documentation\IMAGE_VIDEO_INTEGRATION.md
echo - Summary: documentation\IMPLEMENTATION_SUMMARY.md
echo.

pause

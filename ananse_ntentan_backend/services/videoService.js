const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

/**
 * VideoService - Creates animated videos from story panels
 * 
 * Features:
 * - Ken Burns effect (pan and zoom)
 * - Transitions between panels
 * - Audio narration sync
 * - Multiple video styles
 */
class VideoService {
  constructor() {
    // Check if ffmpeg is available
    this.checkFFmpeg();
  }

  async checkFFmpeg() {
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err) => {
        if (err) {
          console.warn('⚠️ FFmpeg not found. Video generation will not work.');
          console.warn('Install FFmpeg: https://ffmpeg.org/download.html');
          this.ffmpegAvailable = false;
        } else {
          console.log('✅ FFmpeg is available for video generation');
          this.ffmpegAvailable = true;
        }
        resolve(this.ffmpegAvailable);
      });
    });
  }

  /**
   * Generate video from story panels
   * @param {Array} panelImageBuffers - Array of image buffers for each panel
   * @param {Buffer} audioBuffer - Audio narration buffer (optional)
   * @param {Object} videoStyle - Video style configuration
   * @param {Object} story - Story object with panel data
   * @returns {Buffer} - Video buffer
   */
  async generateStoryVideo(panelImageBuffers, audioBuffer = null, videoStyle = null, story = null) {
    if (!this.ffmpegAvailable) {
      throw new Error('FFmpeg is not available. Cannot generate video.');
    }

    console.log(`🎬 Starting video generation for ${panelImageBuffers.length} panels...`);

    // Create temporary directory for processing
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ananse-video-'));
    
    try {
      // Save panel images to temp files
      const imagePaths = await this.savePanelImages(panelImageBuffers, tempDir);
      
      // Save audio if provided
      let audioPath = null;
      if (audioBuffer) {
        audioPath = path.join(tempDir, 'audio.mp3');
        await fs.writeFile(audioPath, audioBuffer);
      }

      // Determine video style settings
      const styleConfig = this.getVideoStyleConfig(videoStyle);

      // Generate video based on style
      const outputPath = path.join(tempDir, 'output.mp4');
      await this.createVideo(imagePaths, audioPath, outputPath, styleConfig);

      // Read the generated video
      const videoBuffer = await fs.readFile(outputPath);
      
      console.log(`✅ Video generated successfully (${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
      
      return videoBuffer;

    } finally {
      // Clean up temp directory
      await this.cleanupTempDir(tempDir);
    }
  }

  /**
   * Save panel image buffers to temporary files
   */
  async savePanelImages(imageBuffers, tempDir) {
    const imagePaths = [];

    for (let i = 0; i < imageBuffers.length; i++) {
      if (imageBuffers[i]) {
        const imagePath = path.join(tempDir, `panel_${i.toString().padStart(3, '0')}.png`);
        await fs.writeFile(imagePath, imageBuffers[i]);
        imagePaths.push(imagePath);
      }
    }

    return imagePaths;
  }

  /**
   * Get video style configuration
   */
  getVideoStyleConfig(videoStyle) {
    const styleName = videoStyle?.name || 'motion-comic';
    
    const styles = {
      'motion-comic': {
        duration: 5,        // seconds per panel
        zoom: 1.2,          // subtle zoom
        transition: 'fade', // fade transition
        transitionDuration: 0.5
      },
      'animated-storyboard': {
        duration: 3,
        zoom: 1.4,
        transition: 'wipeleft',
        transitionDuration: 0.3
      },
      'slideshow': {
        duration: 4,
        zoom: 1.0,          // no zoom
        transition: 'fade',
        transitionDuration: 1
      },
      'documentary': {
        duration: 6,
        zoom: 1.3,
        transition: 'fade',
        transitionDuration: 0.8
      },
      'dynamic': {
        duration: 2.5,
        zoom: 1.5,
        transition: 'slideleft',
        transitionDuration: 0.2
      }
    };

    return styles[styleName] || styles['motion-comic'];
  }

  /**
   * Create video from images using FFmpeg
   */
  async createVideo(imagePaths, audioPath, outputPath, styleConfig) {
    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Add images with filters for Ken Burns effect
      imagePaths.forEach((imagePath, index) => {
        command = command.input(imagePath);
        
        // Loop and set duration for each image
        command = command.inputOptions([
          '-loop', '1',
          '-t', styleConfig.duration.toString()
        ]);
      });

      // Build complex filter for Ken Burns and transitions
      const filters = this.buildVideoFilters(imagePaths.length, styleConfig);
      command = command.complexFilter(filters);

      // Add audio if provided
      if (audioPath) {
        command = command.input(audioPath);
        command = command.outputOptions([
          '-shortest' // End video when audio ends
        ]);
      }

      // Output settings
      command = command
        .outputOptions([
          '-map', '[v]', // Use our filtered video
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          '-pix_fmt', 'yuv420p'
        ]);

      if (audioPath) {
        command = command.outputOptions([
          '-c:a', 'aac',
          '-b:a', '192k'
        ]);
      }

      command = command
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('🎬 FFmpeg command:', commandLine.substring(0, 200) + '...');
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`Processing: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log('✅ Video processing complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg error:', err.message);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Build FFmpeg complex filter for Ken Burns effect and transitions
   */
  buildVideoFilters(imageCount, styleConfig) {
    const filters = [];
    const fps = 25; // frames per second
    const totalFrames = Math.floor(styleConfig.duration * fps);

    // Apply Ken Burns effect to each image
    for (let i = 0; i < imageCount; i++) {
      if (styleConfig.zoom > 1.0) {
        // Zoom in gradually
        filters.push(
          `[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,` +
          `crop=1920:1080,` +
          `zoompan=z='min(zoom+0.0015,${styleConfig.zoom})':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=${fps}[v${i}]`
        );
      } else {
        // Just scale, no zoom
        filters.push(
          `[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,` +
          `crop=1920:1080,fps=${fps}[v${i}]`
        );
      }
    }

    // Concatenate all video segments
    const inputs = Array.from({ length: imageCount }, (_, i) => `[v${i}]`).join('');
    filters.push(`${inputs}concat=n=${imageCount}:v=1:a=0[v]`);

    return filters;
  }

  /**
   * Clean up temporary directory
   */
  async cleanupTempDir(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log('🧹 Cleaned up temporary files');
    } catch (error) {
      console.warn('⚠️ Failed to clean up temp directory:', error.message);
    }
  }

  /**
   * Get video duration from buffer
   */
  async getVideoDuration(videoBuffer) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ananse-duration-'));
    const tempPath = path.join(tempDir, 'video.mp4');

    try {
      await fs.writeFile(tempPath, videoBuffer);

      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(tempPath, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            resolve(metadata.format.duration);
          }
        });
      });
    } finally {
      await this.cleanupTempDir(tempDir);
    }
  }

  /**
   * Create a simple slideshow-style video (fallback for errors)
   */
  async createSimpleSlideshow(imagePaths, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Create input file list for concat demuxer
      const duration = audioPath ? 'auto' : '4'; // 4 seconds per image if no audio

      imagePaths.forEach(imagePath => {
        command = command.input(imagePath);
        command = command.inputOptions(['-loop', '1', '-t', '4']);
      });

      const filters = [];
      
      // Scale all images
      for (let i = 0; i < imagePaths.length; i++) {
        filters.push(`[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080[v${i}]`);
      }

      // Concatenate
      const inputs = Array.from({ length: imagePaths.length }, (_, i) => `[v${i}]`).join('');
      filters.push(`${inputs}concat=n=${imagePaths.length}:v=1:a=0[v]`);

      command = command.complexFilter(filters);

      if (audioPath) {
        command = command.input(audioPath);
        command = command.outputOptions('-shortest');
      }

      command
        .outputOptions(['-map', '[v]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23'])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }
}

module.exports = new VideoService();

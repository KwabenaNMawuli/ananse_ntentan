const Story = require('../models/Story');
const PromptTemplate = require('../models/PromptTemplate');
const ArtisticStyle = require('../models/ArtisticStyle');
const AudioStyle = require('../models/AudioStyle');
const geminiService = require('../services/geminiService');
const audioService = require('../services/audioService');
const fileService = require('../services/fileService');
const imageService = require('../services/imageService');
const videoService = require('../services/videoService');

class StoryController {
  // POST /api/stories/write
  async createWriteStory(req, res, next) {
    try {
      let { text, visualStyleId, audioStyleId } = req.body;

      // Validate input
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Text content is required' 
        });
      }

      // Handle "default" style references
      if (visualStyleId === 'default' || !visualStyleId) {
        const defaultVisual = await ArtisticStyle.findOne({ slug: 'default' });
        if (defaultVisual) visualStyleId = defaultVisual._id;
      }

      if (audioStyleId === 'default' || !audioStyleId) {
        const defaultAudio = await AudioStyle.findOne({ slug: 'default' });
        if (defaultAudio) audioStyleId = defaultAudio._id;
      }

      if (text.length > 5000) {
        return res.status(400).json({ 
          success: false, 
          error: 'Text exceeds maximum length of 5000 characters' 
        });
      }

      // Create initial story record
      const story = new Story({
        type: 'write',
        originalContent: { text },
        visualStyleId,
        audioStyleId,
        status: 'pending'
      });
      await story.save();

      // Return story ID immediately, process asynchronously
      res.status(201).json({
        success: true,
        storyId: story._id,
        status: 'pending',
        message: 'Story is being processed'
      });

      // Process story in background
      this.processStory(story._id, text, visualStyleId, audioStyleId).catch(err => {
        console.error('Story processing error:', err);
      });

    } catch (error) {
      next(error);
    }
  }

  // POST /api/stories/speak
  async createSpeakStory(req, res, next) {
    try {
      // Robust file handling: support single file from 'upload.single' or 'upload.any'
      const audioFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

      if (!audioFile) {
        return res.status(400).json({ 
          success: false, 
          error: 'Audio file is required. Please upload with key "audio".' 
        });
      }

      console.log('Received file:', audioFile.fieldname, audioFile.originalname, audioFile.mimetype);

      let { visualStyleId, audioStyleId } = req.body;
      const audioBuffer = audioFile.buffer;

       // Handle "default" style references and invalid IDs
       if (!visualStyleId || visualStyleId === 'default' || visualStyleId.includes('/')) {
        const defaultVisual = await ArtisticStyle.findOne({ slug: 'default' });
        if (defaultVisual) {
          visualStyleId = defaultVisual._id;
        } else {
          visualStyleId = null; // Will be handled in processStory
        }
      }

      if (!audioStyleId || audioStyleId === 'default' || audioStyleId.includes('/')) {
        const defaultAudio = await AudioStyle.findOne({ slug: 'default' });
        if (defaultAudio) {
          audioStyleId = defaultAudio._id;
        } else {
          audioStyleId = null;
        }
      }

      // Upload original audio
      const originalFileId = await fileService.uploadFile(
        audioBuffer,
        `story-speak-${Date.now()}.mp3`,
        { type: 'original-audio', mimetype: audioFile.mimetype }
      );

      // Create initial story record
      const story = new Story({
        type: 'speak',
        originalContent: { 
          audioFileId: originalFileId 
        },
        visualStyleId,
        audioStyleId,
        status: 'pending'
      });
      await story.save();

      res.status(201).json({
        success: true,
        storyId: story._id,
        status: 'pending',
        message: 'Audio story received and processing started'
      });

      // Process in background
      this.processSpeakStory(story._id, audioBuffer, audioFile.mimetype, visualStyleId, audioStyleId).catch(err => {
        console.error('Speak story processing error:', err);
      });

    } catch (error) {
      next(error);
    }
  }

  // POST /api/stories/sketch
  async createSketchStory(req, res, next) {
    try {
      const imageFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

      if (!imageFile) {
        return res.status(400).json({ 
          success: false, 
          error: 'Image file is required.' 
        });
      }

      let { visualStyleId, audioStyleId } = req.body;
      const imageBuffer = imageFile.buffer;

       // Handle "default" style references and invalid IDs
       if (!visualStyleId || visualStyleId === 'default' || visualStyleId.includes('/')) {
        const defaultVisual = await ArtisticStyle.findOne({ slug: 'default' });
        if (defaultVisual) {
          visualStyleId = defaultVisual._id;
        } else {
          visualStyleId = null;
        }
      }

      if (!audioStyleId || audioStyleId === 'default' || audioStyleId.includes('/')) {
        const defaultAudio = await AudioStyle.findOne({ slug: 'default' });
        if (defaultAudio) {
          audioStyleId = defaultAudio._id;
        } else {
          audioStyleId = null;
        }
      }

      // Upload original image
      const originalFileId = await fileService.uploadFile(
        imageBuffer,
        `story-sketch-${Date.now()}-${imageFile.originalname}`,
        { type: 'original-image', mimetype: imageFile.mimetype }
      );

      // Create initial story record
      const story = new Story({
        type: 'sketch',
        originalContent: { 
          imageFileId: originalFileId 
        },
        visualStyleId,
        audioStyleId,
        status: 'pending'
      });
      await story.save();

      res.status(201).json({
        success: true,
        storyId: story._id,
        status: 'pending',
        message: 'Sketch story received and processing started'
      });

      // Process in background
      this.processSketchStory(story._id, imageBuffer, imageFile.mimetype, visualStyleId, audioStyleId).catch(err => {
        console.error('Sketch story processing error:', err);
      });

    } catch (error) {
      next(error);
    }
  }

  async processSketchStory(storyId, imageBuffer, mimeType, visualStyleId, audioStyleId) {
    const startTime = Date.now();
    try {
        await Story.findByIdAndUpdate(storyId, { status: 'processing' });
        console.log(`🎨 Analyzing sketch for story ${storyId}...`);

        const description = await geminiService.analyzeImage(imageBuffer, mimeType);
        console.log(`✅ Image analysis complete: "${description.substring(0, 50)}..."`);

        // Update story with description
        await Story.findByIdAndUpdate(storyId, {
            'originalContent.text': description,
            'originalContent.transcription': description // Reusing transcription field for description text
        });

        // Hand off to main text processing
        await this.processStory(storyId, description, visualStyleId, audioStyleId);

    } catch (error) {
        console.error(`❌ Sketch processing failed for ${storyId}:`, error);
        await Story.findByIdAndUpdate(storyId, {
            status: 'failed',
            errorMessage: 'Image analysis failed: ' + error.message,
            processingTime: Date.now() - startTime
        });
    }
  }

  async processSpeakStory(storyId, audioBuffer, visualStyleId, audioStyleId) {
    const startTime = Date.now();
    try {
        await Story.findByIdAndUpdate(storyId, { status: 'processing' });
        console.log(`🎙️ Transcribing audio for story ${storyId}...`);

        const transcription = await geminiService.transcribeAudio(audioBuffer);
        console.log(`✅ Transcription complete: "${transcription.substring(0, 50)}..."`);

        // Update story with transcription
        await Story.findByIdAndUpdate(storyId, {
            'originalContent.text': transcription,
            'originalContent.transcription': transcription
        });

        // Hand off to main text processing
        // Note: processStory handles its own status updates and error handling
        await this.processStory(storyId, transcription, visualStyleId, audioStyleId);

    } catch (error) {
        console.error(`❌ Speak processing failed for ${storyId}:`, error);
        await Story.findByIdAndUpdate(storyId, {
            status: 'failed',
            errorMessage: 'Transcription failed: ' + error.message,
            processingTime: Date.now() - startTime
        });
    }
  }

  async processStory(storyId, text, visualStyleId, audioStyleId) {
    const startTime = Date.now();

    try {
      // Update status to processing
      await Story.findByIdAndUpdate(storyId, { status: 'processing' });

      // 1. Get prompt template (use first active WRITE template for now)
      const promptTemplate = await PromptTemplate.findOne({ 
        type: 'write', 
        isActive: true 
      });

      if (!promptTemplate) {
        throw new Error('No active prompt template found for WRITE stories');
      }

      // 2. Get visual style (optional)
      let visualStyle = null;
      if (visualStyleId) {
        visualStyle = await ArtisticStyle.findById(visualStyleId);
      }

      // 3. Generate story with Gemini
      console.log('Generating story with Gemini...');
      const storyData = await geminiService.generateStory(
        text,
        promptTemplate,
        visualStyle
      );

      // 4. Extract narration script
      const narrationScript = storyData.narration || 
                              storyData.script || 
                              this.extractNarrationFromPanels(storyData.panels);

      // 5. Get audio style (optional)
      let audioStyle = null;
      if (audioStyleId) {
        audioStyle = await AudioStyle.findById(audioStyleId);
      }

      // 6. Generate audio narration (SKIPPED TEMPORARILY)
      console.log('Skipping audio narration generation as per request...');
      // const audioBuffer = await audioService.generateAudio(narrationScript, audioStyle);
      // const audioDuration = await audioService.getDuration(audioBuffer);
      const audioDuration = 0;

      // 7. Store audio in GridFS (SKIPPED)
      // const audioFileId = await fileService.uploadFile(
      //   audioBuffer,
      //   `story-${storyId}-audio.mp3`,
      //   { storyId, type: 'audio-narration' }
      // );
       const audioFileId = null;

      // 8. Generate images for panels (NEW)
      console.log('🎨 Generating images for story panels...');
      let panelImageFileIds = [];
      const enableImageGeneration = process.env.ENABLE_IMAGE_GENERATION === 'true';
      
      if (enableImageGeneration && storyData.panels && storyData.panels.length > 0) {
        try {
          const imageBuffers = await imageService.generateAllPanelImages(
            storyData.panels,
            visualStyle
          );

          // Upload each panel image to GridFS
          for (let i = 0; i < imageBuffers.length; i++) {
            if (imageBuffers[i]) {
              const contentType = imageBuffers[i].contentType || 'image/png';
              const fileId = await fileService.uploadFile(
                imageBuffers[i],
                `story-${storyId}-panel-${i + 1}.png`,
                { storyId, type: 'panel-image', panelNumber: i + 1, contentType }
              );
              panelImageFileIds.push(fileId);
              
              // Update panel with imageFileId
              storyData.panels[i].imageFileId = fileId;
            } else {
              panelImageFileIds.push(null);
            }
          }
          console.log(`✅ Generated and stored ${panelImageFileIds.filter(id => id).length} panel images`);
        } catch (error) {
          console.error('⚠️ Image generation failed, continuing without images:', error.message);
        }
      }

      // 9. Generate video from panels (NEW)
      let videoFileId = null;
      let videoDuration = 0;
      const enableVideoGeneration = process.env.ENABLE_VIDEO_GENERATION === 'true';
      const videoProbabilityRaw = parseFloat(process.env.VIDEO_GENERATION_PROBABILITY || '0.25');
      const videoProbability = Number.isFinite(videoProbabilityRaw)
        ? Math.min(Math.max(videoProbabilityRaw, 0), 1)
        : 0.25;
      const shouldGenerateVideo = Math.random() < videoProbability;
      const hasPanelImages = panelImageFileIds.filter(id => id).length > 0;
      
      if (enableVideoGeneration && hasPanelImages && shouldGenerateVideo) {
        try {
          console.log('🎬 Generating animated video from panels...');
          
          let imageBuffersForVideo = [];

          // Optionally regenerate images for video using a different model
          if (process.env.VIDEO_IMAGE_MODEL) {
            try {
              const videoImageBuffers = await imageService.generateAllPanelImages(
                storyData.panels,
                visualStyle,
                { model: process.env.VIDEO_IMAGE_MODEL }
              );
              imageBuffersForVideo = videoImageBuffers.filter(buffer => buffer);
              console.log(`✅ Generated ${imageBuffersForVideo.length} video-specific panel images`);
            } catch (error) {
              console.error('⚠️ Video image generation failed, falling back to stored panels:', error.message);
            }
          }

          // Fallback: Get image buffers back from GridFS for video processing
          if (imageBuffersForVideo.length === 0) {
            for (const fileId of panelImageFileIds) {
              if (fileId) {
                const buffer = await fileService.downloadFile(fileId);
                imageBuffersForVideo.push(buffer);
              }
            }
          }

          if (imageBuffersForVideo.length === 0) {
            throw new Error('No images available for video generation');
          }

          // Generate video
          const videoBuffer = await videoService.generateStoryVideo(
            imageBuffersForVideo,
            null, // audioBuffer (null for now since audio generation is disabled)
            null, // videoStyle (can be passed from request in future)
            storyData
          );

          // Upload video to GridFS
          videoFileId = await fileService.uploadFile(
            videoBuffer,
            `story-${storyId}-video.mp4`,
            { storyId, type: 'story-video' }
          );

          // Get video duration
          videoDuration = await videoService.getVideoDuration(videoBuffer);
          
          console.log(`✅ Video generated and stored (${videoDuration.toFixed(1)}s)`);
        } catch (error) {
          console.error('⚠️ Video generation failed, continuing without video:', error.message);
        }
      }
      else if (enableVideoGeneration && hasPanelImages && !shouldGenerateVideo) {
        console.log('🎬 Video generation skipped by probability setting');
      }

      // 10. Update story with complete data
      const processingTime = Date.now() - startTime;
      await Story.findByIdAndUpdate(storyId, {
        visualNarrative: {
          panels: storyData.panels || [],
          style: visualStyle?.name || 'default',
          videoFileId,
          videoDuration
        },
        audioNarrative: {
          script: narrationScript,
          audioFileId,
          duration: audioDuration,
          style: audioStyle?.name || 'default'
        },
        promptTemplateId: promptTemplate._id,
        status: 'complete',
        processingTime
      });

      console.log(`✅ Story ${storyId} processed successfully in ${processingTime}ms`);

    } catch (error) {
      console.error(`❌ Story ${storyId} processing failed:`, error);
      
      // Update story with error
      await Story.findByIdAndUpdate(storyId, {
        status: 'failed',
        errorMessage: error.message,
        processingTime: Date.now() - startTime
      });
    }
  }

  // Helper to extract narration from panels if no direct script
  extractNarrationFromPanels(panels) {
    if (!panels || panels.length === 0) {
      return 'No narration available.';
    }

    return panels.map(panel => {
      const parts = [];
      if (panel.description) parts.push(panel.description);
      if (panel.dialogue) parts.push(panel.dialogue);
      return parts.join('. ');
    }).join(' ');
  }

  // GET /api/stories/:id/status
  async getStoryStatus(req, res, next) {
    try {
      const { id } = req.params;
      
      const story = await Story.findById(id)
        .select('status processingTime errorMessage type')
        .lean();

      if (!story) {
        return res.status(404).json({
          success: false,
          error: 'Story not found'
        });
      }

      res.json({
        success: true,
        status: story.status,
        type: story.type,
        processingTime: story.processingTime,
        ...(story.errorMessage && { error: story.errorMessage })
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /api/stories/:id
  async getStory(req, res, next) {
    try {
      const { id } = req.params;
      
      const story = await Story.findById(id)
        .populate('visualStyleId')
        .populate('audioStyleId')
        .populate('promptTemplateId')
        .lean();

      if (!story) {
        return res.status(404).json({
          success: false,
          error: 'Story not found'
        });
      }

      res.json({
        success: true,
        story
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StoryController();

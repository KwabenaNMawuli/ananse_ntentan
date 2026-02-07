import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { preferences, getPromptModifiers, getPanelCount } = usePreferences();
  const [activeTab, setActiveTab] = useState('speak');
  const apiRoot = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const apiBase = apiRoot.endsWith('/api') ? apiRoot : `${apiRoot.replace(/\/+$/, '')}/api`;
  
  // Input States
  const [writeText, setWriteText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waveformData, setWaveformData] = useState(Array(20).fill(0));
  const animationRef = useRef(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Audio Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setAudioBlob(null); // Clear previous
      startRecording();
    }
  };

  // Simulate waveform animation
  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        setWaveformData(prev => 
          prev.map(() => Math.random() * 100)
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setWaveformData(Array(20).fill(0));
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);


  const handleRefresh = () => {
    stopRecording();
    setAudioBlob(null);
    setWriteText('');
    setSelectedImage(null);
    setWaveformData(Array(20).fill(0));
    setGeneratedStory(null);
    setLoadingProgress(0);
  };

  const pollStoryStatus = async (storyId) => {
    const maxAttempts = 60; // Poll for up to 2 minutes
    let attempts = 0;
    const messages = [
      'Analyzing transmission...',
      'Interpreting echoes...',
      'Generating visual fragments...',
      'Rendering panels...',
      'Synchronizing narrative...',
      'Finalizing transmission...'
    ];

    const poll = async () => {
      try {
        attempts++;
        const messageIndex = Math.min(Math.floor(attempts / 10), messages.length - 1);
        setLoadingMessage(messages[messageIndex]);
        setLoadingProgress(Math.min((attempts / maxAttempts) * 100, 95));

        console.log(`Polling attempt ${attempts} for story ${storyId}...`);
        
        const response = await fetch(`${apiBase}/stories/${storyId}/status`);
        
        if (!response.ok) {
          console.error('Status check failed:', response.status, await response.text());
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000);
            return;
          } else {
            throw new Error('Status check failed repeatedly');
          }
        }
        
        const data = await response.json();
        console.log(`Story status (attempt ${attempts}):`, data);

        // Check for 'complete' OR 'completed' (backend uses 'complete')
        if (data.status === 'complete' || data.status === 'completed') {
          console.log('✅ Story completed! Fetching full story...');
          setLoadingProgress(100);
          setLoadingMessage('Transmission complete!');
          
          // Fetch the full story
          const storyResponse = await fetch(`${apiBase}/stories/${storyId}`);
          if (!storyResponse.ok) {
            const errorText = await storyResponse.text();
            console.error('Failed to fetch story:', errorText);
            throw new Error('Failed to fetch completed story');
          }
          
          const storyData = await storyResponse.json();
          console.log('✅ Full story received:', storyData);
          
          if (storyData.success && storyData.story) {
            setTimeout(() => {
              setGeneratedStory(storyData.story);
              setIsSubmitting(false);
            }, 500);
          } else {
            throw new Error('Story data invalid or missing');
          }
        } else if (data.status === 'failed') {
          console.error('❌ Story generation failed:', data.error);
          throw new Error(data.error || 'Story generation failed');
        } else if (data.status === 'processing' || data.status === 'pending') {
          console.log(`⏳ Story still ${data.status}, waiting...`);
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000); // Poll every 2 seconds
          } else {
            // Timeout - try to fetch anyway in case it's complete but status not updated
            console.warn('⚠️ Polling timeout, attempting to fetch story anyway...');
            try {
              const storyResponse = await fetch(`${apiBase}/stories/${storyId}`);
              if (storyResponse.ok) {
                const storyData = await storyResponse.json();
                if (storyData.success && storyData.story) {
                  setGeneratedStory(storyData.story);
                  setIsSubmitting(false);
                  return;
                }
              }
            } catch (e) {
              console.error('Fallback fetch failed:', e);
            }
            throw new Error('Generation timeout - took longer than 2 minutes. Check the Archive to see if your story completed.');
          }
        } else {
          console.warn('Unknown status:', data.status);
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000);
          } else {
            throw new Error(`Unknown story status: ${data.status}`);
          }
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
        setIsSubmitting(false);
        setLoadingProgress(0);
        setLoadingMessage('');
        
        // Show user-friendly error with actionable info
        alert(
          `⚠️ Could not complete transmission display:\n\n${error.message}\n\n` +
          `Your story may have been created successfully.\n` +
          `Please check the Archive (My Feed) to see if it appears there.\n\n` +
          `Story ID: ${storyId}`
        );
      }
    };

    poll();
  };


  const handleCastIntoVoid = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoadingProgress(5);
    setLoadingMessage('Transmitting into the void...');

    const formData = new FormData();
    formData.append('visualStyleId', 'default');
    formData.append('audioStyleId', 'default');
    
    // Add user preferences to FormData
    const modifiers = getPromptModifiers();
    const panelCount = getPanelCount();
    formData.append('promptModifiers', JSON.stringify(modifiers));
    formData.append('panelCount', JSON.stringify(panelCount));
    if (preferences) {
      formData.append('userProfile', JSON.stringify(preferences));
    }

    try {
      let response;
      
      if (activeTab === 'write') {
        if (!writeText.trim()) throw new Error("The void demands words.");
        
        // Get user preferences
        const modifiers = getPromptModifiers();
        const panelCount = getPanelCount();
        
        response = await fetch(`${apiBase}/stories/write`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: writeText,
                visualStyleId: 'default',
                audioStyleId: 'default',
                preferences: {
                  promptModifiers: modifiers,
                  panelCount: panelCount,
                  userProfile: preferences
                }
            })
        });
        
      } else if (activeTab === 'speak') {
        if (!audioBlob) throw new Error("No echo recorded.");
        formData.append('audio', audioBlob, 'recording.webm');
        
        response = await fetch(`${apiBase}/stories/speak`, {
            method: 'POST',
            body: formData
        });

      } else if (activeTab === 'sketch') {
        if (!selectedImage) throw new Error("No visual artifact provided.");
        formData.append('image', selectedImage);

        response = await fetch(`${apiBase}/stories/sketch`, {
            method: 'POST',
            body: formData
        });
      }

      if (!response) {
        throw new Error('No response received from server');
      }

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Transmission response:", data);
      
      // Start polling for story completion
      if (data.storyId) {
        console.log('Story ID received:', data.storyId);
        pollStoryStatus(data.storyId);
      } else {
        console.error('No story ID in response:', data);
        throw new Error('No story ID returned from server');
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to submit: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. MongoDB is connected\n3. Check browser console for details`);
      setIsSubmitting(false);
      setLoadingProgress(0);
      setLoadingMessage('');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        setSelectedImage(file);
    }
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">OFFER YOUR FRAGMENT</h1>
        <p className="hero-subtitle">
          The Void transforms what it consumes.<br />
          Select your medium to begin the ingestion.
        </p>

        <div className="content-card">
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'speak' ? 'active' : ''}`}
              onClick={() => setActiveTab('speak')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              SPEAK
            </button>
            <button 
              className={`tab ${activeTab === 'write' ? 'active' : ''}`}
              onClick={() => setActiveTab('write')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              WRITE
            </button>
            <button 
              className={`tab ${activeTab === 'sketch' ? 'active' : ''}`}
              onClick={() => setActiveTab('sketch')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                <path d="M2 2l7.586 7.586"></path>
                <circle cx="11" cy="11" r="2"></circle>
              </svg>
              SKETCH
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'speak' && (
              <div className="speak-content">
                <div className="waveform-container">
                  <div className="waveform">
                    {waveformData.map((height, index) => (
                      <div 
                        key={index} 
                        className="waveform-bar"
                        style={{ 
                          height: isRecording ? `${height}%` : '10%',
                          animationDelay: `${index * 0.05}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <p className="prompt-text">
                    {isRecording ? "LISTENING..." : (audioBlob ? "ECHO CAPTURED." : "WHISPER YOUR SECRETS...")}
                </p>
                <div className="controls">
                  <button 
                    className="control-btn secondary"
                    onClick={handleRefresh}
                    aria-label="Refresh"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                    </svg>
                  </button>
                  <button 
                    className={`control-btn primary ${isRecording ? 'recording' : ''}`}
                    onClick={handleMicToggle}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isRecording ? (
                         <rect x="6" y="6" width="12" height="12"></rect>
                      ) : (
                         <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'write' && (
              <div className="write-content">
                <textarea 
                  className="write-textarea"
                  placeholder="Pour your thoughts into the void..."
                  rows="10"
                  value={writeText}
                  onChange={(e) => setWriteText(e.target.value)}
                ></textarea>
              </div>
            )}

            {activeTab === 'sketch' && (
              <div className="sketch-content">
                <div className="sketch-canvas" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedImage ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#00ffff' }}>Artifact Selected: {selectedImage.name}</p>
                            <img src={URL.createObjectURL(selectedImage)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '1rem', border: '1px solid #00ffff' }} />
                        </div>
                    ) : (
                        <>
                          <p className="canvas-placeholder">Upload visual artifact</p>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            style={{ marginTop: '1rem', color: '#fff' }}
                          />
                        </>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cast Button */}
        <button 
            className="cast-btn" 
            onClick={handleCastIntoVoid}
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.5 : 1 }}
        >
          {isSubmitting ? 'TRANSMITTING...' : 'CAST INTO THE VOID'}
          <span className="cast-icon">✦</span>
        </button>

        {/* Footer Status */}
        <div className="status-footer">
          <div className="status-left">
            <span className="status-label">RESONANCE LEVEL</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '35%' }}></div>
            </div>
            <span className="status-value">035.4</span>
          </div>
          <div className="status-center">
            <span className={`status-indicator ${isSubmitting ? 'pulse' : 'active'}`}></span>
            <span className="status-text">{isSubmitting ? 'INGESTING...' : 'SYSTEM READY'}</span>
          </div>
        </div>
      </div>

      {/* Loading Screen Overlay */}
      {isSubmitting && !generatedStory && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h2 className="loading-title">{loadingMessage}</h2>
            <div className="loading-progress-bar">
              <div className="loading-progress-fill" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="loading-percentage">{Math.round(loadingProgress)}%</p>
            <p className="loading-hint">The void is processing your transmission...</p>
          </div>
        </div>
      )}

      {/* Generated Story Display */}
      {generatedStory && (
        <div className="story-result-overlay">
          <div className="story-result-container">
            <div className="story-result-header">
              <h2 className="result-title">✦ TRANSMISSION RECEIVED ✦</h2>
              <button className="close-story-btn" onClick={handleRefresh}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="story-result-content">
              <StoryDisplay story={generatedStory} apiBase={apiBase} />
            </div>

            <div className="story-result-actions">
              <button className="action-btn secondary" onClick={handleRefresh}>
                ← Create Another Transmission
              </button>
              <button className="action-btn secondary" onClick={() => navigate('/archive')}>
                View All Stories in Archive →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Story Display Component
const StoryDisplay = ({ story, apiBase }) => {
  const isValidObjectId = (value) => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
  const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (value.$oid) return value.$oid;
      if (value._id) return normalizeId(value._id);
      if (typeof value.toString === 'function') return value.toString();
    }
    return null;
  };
  const getImageId = (panel) => {
    const candidate = normalizeId(panel?.imageFileId);
    return isValidObjectId(candidate) ? candidate : null;
  };

  const panels = story.visualNarrative?.panels || [];

  return (
    <div className="story-display">
      <div className="story-meta">
        <span className="story-type-badge">{story.type.toUpperCase()}</span>
        <h3 className="story-id">Story #{story._id?.slice(-6)}</h3>
      </div>

      <div className="story-panels">
        {panels.map((panel, index) => {
          const imageId = getImageId(panel);
          const imageUrl = imageId ? `${apiBase}/files/image/${imageId}` : null;
          
          return (
            <div key={index} className="story-panel-item">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={`Panel ${panel.number}`}
                  className="story-panel-image"
                  onError={(e) => console.error('Image load error:', imageUrl)}
                />
              )}
              <div className="story-panel-text">
                <div className="panel-label">PANEL {panel.number}</div>
                <p className="panel-dialogue">"{panel.dialogue || panel.description}"</p>
                {panel.scene && <p className="panel-scene">{panel.scene}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {story.audioNarrative?.audioFileId && (
        <div className="story-audio">
          <h4 className="audio-title">AUDIO NARRATION</h4>
          <audio controls style={{ width: '100%' }}>
            <source src={`${apiBase}/files/audio/${story.audioNarrative.audioFileId}`} type="audio/mpeg" />
          </audio>
        </div>
      )}
    </div>
  );
};

export default HomePage;

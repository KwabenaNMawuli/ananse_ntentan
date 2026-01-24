import React, { useState, useRef, useEffect } from 'react';
import './HomePage.css';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('speak');
  const [isRecording, setIsRecording] = useState(false);
  const [waveformData, setWaveformData] = useState(Array(20).fill(0));
  const animationRef = useRef(null);

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

  const handleMicToggle = () => {
    setIsRecording(!isRecording);
  };

  const handleRefresh = () => {
    setIsRecording(false);
    setWaveformData(Array(20).fill(0));
  };

  const handleStop = () => {
    setIsRecording(false);
  };

  const handleCastIntoVoid = () => {
    console.log('Casting into the void...');
    // Add your submission logic here
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
                <p className="prompt-text">WHISPER YOUR SECRETS...</p>
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
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  </button>
                  <button 
                    className="control-btn secondary"
                    onClick={handleStop}
                    aria-label="Stop"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="6" width="12" height="12"></rect>
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
                ></textarea>
              </div>
            )}

            {activeTab === 'sketch' && (
              <div className="sketch-content">
                <div className="sketch-canvas">
                  <p className="canvas-placeholder">Canvas will be initialized here...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cast Button */}
        <button className="cast-btn" onClick={handleCastIntoVoid}>
          CAST INTO THE VOID
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
            <span className="status-indicator active"></span>
            <span className="status-text">INGESTING PROTOCOL... READY</span>
          </div>
          <div className="status-right">
            <span className="status-label">SYSTEM NOMAD</span>
            <span className="status-label">TERMINAL LOCK</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

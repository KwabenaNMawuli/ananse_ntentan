import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Feed.css';

const Feed = () => {
  const [viewLikes, setViewLikes] = useState(1200);
  const [echoLikes, setEchoLikes] = useState(48);
  const [hasLikedView, setHasLikedView] = useState(false);
  const [hasLikedEcho, setHasLikedEcho] = useState(false);

  const handleViewLike = () => {
    if (hasLikedView) {
      setViewLikes(viewLikes - 1);
      setHasLikedView(false);
    } else {
      setViewLikes(viewLikes + 1);
      setHasLikedView(true);
    }
  };

  const handleEchoLike = () => {
    if (hasLikedEcho) {
      setEchoLikes(echoLikes - 1);
      setHasLikedEcho(false);
    } else {
      setEchoLikes(echoLikes + 1);
      setHasLikedEcho(true);
    }
  };

  const handleDownload = () => {
    console.log('Downloading sequence...');
    // Add download logic here
  };

  const handleTransmit = () => {
    console.log('Transmitting...');
    // Add transmit logic here
  };

  const formatLikes = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count;
  };

  return (
    <div className="comic-viewer">
      <div className="comic-container">
        {/* Header Badge */}
        <div className="transmission-badge">
          <span className="badge-icon">✦</span>
          <span className="badge-text">COMMON TRANSMISSION</span>
        </div>

        {/* Title Section */}
        <div className="comic-header">
          <h1 className="comic-title">Echo Received: The Comic</h1>
          <p className="comic-subtitle">
            An AI interpretation of <span className="author-highlight">AstralTraveler</span>'s original echo submission.
          </p>
        </div>

        {/* Comic Panels */}
        <div className="comic-panels">
          {/* Panel 1 - Cityscape */}
          <div className="panel panel-large">
            <div className="panel-image cityscape">
              <div className="panel-overlay">
                <p className="panel-quote">
                  "The void whispers in neon frequencies, reflecting a city that forgot how to sleep..."
                </p>
              </div>
            </div>
          </div>

          {/* Panel 2 - Eye */}
          <div className="panel panel-large">
            <div className="panel-image eye">
              <div className="system-alert">
                <div className="alert-header">SYSTEM ALERT</div>
                <div className="alert-text">
                  Is there anybody listening?<br />
                  Or am I just talking to the void?
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3 - Synchronizing */}
          <div className="panel panel-large">
            <div className="panel-image sync">
              <div className="sync-overlay">
                <h2 className="sync-title">SYNCHRONIZING</h2>
                <p className="sync-subtitle">
                  The signals align, revealing the hidden paths<br />
                  within the architecture of the Void.
                </p>
              </div>
            </div>
          </div>

          {/* Panel 4 - Portal */}
          <div className="panel panel-large">
            <div className="panel-image portal">
              <div className="portal-overlay">
                <p className="portal-text">A new sequence begins.</p>
                <p className="portal-subtext">Enter the cycle</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="comic-actions">
          <button className="btn-primary" onClick={handleDownload}>
            <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Sequence
          </button>
          <button className="btn-secondary" onClick={handleTransmit}>
            <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Transmit
          </button>
        </div>

        {/* Return Link */}
        <Link to="/" className="return-link">
          <svg className="return-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Return to Home
        </Link>

        {/* Like Stats */}
        <div className="comic-stats">
          <button 
            className={`stat-item ${hasLikedView ? 'liked' : ''}`}
            onClick={handleViewLike}
          >
            <svg className="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill={hasLikedView ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="stat-count">{formatLikes(viewLikes)} Views</span>
          </button>
          <button 
            className={`stat-item ${hasLikedEcho ? 'liked' : ''}`}
            onClick={handleEchoLike}
          >
            <svg className="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill={hasLikedEcho ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="stat-count">{formatLikes(echoLikes)} Likes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feed;

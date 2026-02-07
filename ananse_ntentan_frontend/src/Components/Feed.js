import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Feed.css';

const Feed = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentPair, setCurrentPair] = useState(0);
  const apiRoot = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const apiBase = apiRoot.endsWith('/api') ? apiRoot : `${apiRoot.replace(/\/+$/, '')}/api`;

  const fetchStories = useCallback(async (nextPage = 1, replace = false) => {
    try {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`${apiBase}/feed?page=${nextPage}&limit=2`);
      const data = await response.json();
      if (data.success) {
        setStories(prev => (replace ? data.stories : [...prev, ...data.stories]));
        setPage(nextPage);
        const totalPages = data.pagination?.pages || 1;
        setHasMore(nextPage < totalPages);
      } else {
        setError('Failed to load stories');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchStories(1, true);
  }, [fetchStories]);


  if (loading) return <div className="feed-container"><p className="loading-text">Receiving Transmissions...</p></div>;
  if (error) return <div className="feed-container"><p className="error-text">{error}</p></div>;

  const currentStories = stories.slice(currentPair * 2, currentPair * 2 + 2);
  const canLoadMore = hasMore || (currentPair + 1) * 2 < stories.length;

  const loadNextPair = async () => {
    const nextPairIndex = currentPair + 1;
    const nextPairStart = nextPairIndex * 2;
    
    // Check if we need to fetch more stories
    if (nextPairStart >= stories.length && hasMore) {
      await fetchStories(page + 1, false);
    }
    setCurrentPair(nextPairIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="feed-container">
      <div className="stories-wrapper">
        {currentStories.map(story => (
          <StoryCard key={story._id} story={story} apiBase={apiBase} />
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="feed-navigation">
        {currentPair > 0 && (
          <button className="nav-pair-button" onClick={() => { setCurrentPair(currentPair - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Previous Pair
          </button>
        )}
        
        {canLoadMore && (
          <button className="nav-pair-button" onClick={loadNextPair} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Next Pair'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>
      
      {/* Return Link */}
      <div className="feed-footer">
        <Link to="/" className="return-link">
          <svg className="return-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

const StoryCard = ({ story, apiBase }) => {
  const [likes, setLikes] = useState(story.metadata?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

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

  // Use panels from the story, or fallback to empty array
  const panels = story.visualNarrative?.panels || [];

  const handleLike = async () => {
    if (hasLiked) return; // Simple debounce for now
    try {
        setLikes(prev => prev + 1);
        setHasLiked(true);
        // Fire and forget like API
        fetch(`${apiBase}/feed/${story._id}/like`, { method: 'POST' });
    } catch (e) {
        console.error(e);
    }
  };

  return (
      <div className="comic-container" style={{ marginBottom: '4rem' }}>
        {/* Header Badge */}
        <div className="transmission-badge">
          <span className="badge-icon">✦</span>
          <span className="badge-text">{story.type.toUpperCase()} TRANSMISSION</span>
        </div>

        {/* Title Section */}
        <div className="comic-header">
          <h1 className="comic-title">Story #{story._id.slice(-6)}</h1>
          <p className="comic-subtitle">
            An AI interpretation of an anonymous <span className="author-highlight">{story.type}</span> submission.
          </p>
        </div>

        {/* Comic Panels - All Panels Displayed Vertically */}
        <div className="comic-panels">
          {panels.length > 0 ? (
            panels.map((panel, index) => {
              const imageId = getImageId(panel);
              const imageUrl = imageId ? `${apiBase}/files/image/${imageId}` : null;
              return (
                <div key={index} className="panel panel-large">
                    {imageUrl ? (
                      <div className="panel-image" style={{ position: 'relative', backgroundColor: '#1a1a1a', overflow: 'hidden' }}>
                        <img
                          src={imageUrl}
                          alt={`Panel ${panel.number}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 1
                          }}
                          onError={(event) => {
                            console.error('Failed to load image:', imageUrl);
                          }}
                        />
                        <div className="panel-overlay" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}>
                          <div style={{ color: '#888', marginBottom: '10px', fontSize: '0.8em' }}>CAPTION:</div>
                          <p className="panel-quote" style={{ fontStyle: 'italic' }}>
                            "{panel.dialogue || panel.description}"
                          </p>
                          <p style={{ marginTop: '10px', fontSize: '0.9em' }}>{panel.scene}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="panel-image" style={{ backgroundColor: '#1a1a1a', display: 'flex', flexDirection: 'column', padding: '20px', justifyContent: 'center' }}>
                        <div className="panel-overlay" style={{ position: 'relative', bottom: 'auto' }}>
                          <div style={{ color: '#888', marginBottom: '10px', fontSize: '0.8em' }}>PANEL {panel.number}</div>
                          <p className="panel-quote" style={{ fontStyle: 'italic' }}>
                            "{panel.dialogue || panel.description}"
                          </p>
                          <p style={{ marginTop: '10px', fontSize: '0.9em' }}>{panel.scene}</p>
                        </div>
                      </div>
                    )}
                </div>
              );
            })
          ) : (
            <div className="panel panel-large">
                 <div className="panel-image">
                    <div className="panel-overlay">
                        <p>No visual panels generated for this story.</p>
                        <p>{story.originalContent?.text}</p>
                    </div>
                </div>
            </div>
          )}
        </div>

        {/* Audio Player if available */}
        {story.audioNarrative?.audioFileId && (
            <div className="audio-player-container" style={{ padding: '20px', borderTop: '1px solid #333' }}>
                <h3 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px' }}>AUDIO NARRATION</h3>
                <audio controls style={{ width: '100%' }}>
                    <source src={`${apiBase}/files/audio/${story.audioNarrative.audioFileId}`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        )}

        {/* Like Stats */}
        <div className="comic-stats">
          <button 
            className={`stat-item ${hasLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <svg className="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="stat-count">{likes} Likes</span>
          </button>
        </div>
      </div>
  );
};


export default Feed;

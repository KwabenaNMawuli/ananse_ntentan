import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const [profileData] = useState({
    username: 'VoidWanderer',
    joinDate: 'December 2025',
    totalTransmissions: 127,
    totalLikes: 2845,
    resonanceLevel: 35.4,
    status: 'Active Traveler'
  });

  const [recentTransmissions] = useState([
    {
      id: 1,
      title: 'Echo Received: The Comic',
      type: 'Visual',
      date: 'Jan 20, 2026',
      likes: 48,
      views: 1200
    },
    {
      id: 2,
      title: 'Whispers in the Digital Void',
      type: 'Audio',
      date: 'Jan 18, 2026',
      likes: 92,
      views: 856
    },
    {
      id: 3,
      title: 'The Architecture of Nothing',
      type: 'Text',
      date: 'Jan 15, 2026',
      likes: 134,
      views: 1543
    }
  ]);

  const [achievements] = useState([
    { icon: '✦', title: 'First Transmission', unlocked: true },
    { icon: '⚡', title: 'Void Explorer', unlocked: true },
    { icon: '🌟', title: 'Echo Master', unlocked: true },
    { icon: '🔮', title: 'Reality Bender', unlocked: false },
    { icon: '👁️', title: 'Void Seer', unlocked: false },
    { icon: '🌌', title: 'Cosmic Wanderer', unlocked: false }
  ]);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="status-badge">{profileData.status}</div>
          </div>
          
          <div className="profile-info">
            <h1 className="profile-username">{profileData.username}</h1>
            <p className="profile-meta">Member since {profileData.joinDate}</p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{profileData.totalTransmissions}</span>
                <span className="stat-label">Transmissions</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">{profileData.totalLikes}</span>
                <span className="stat-label">Total Likes</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">{profileData.resonanceLevel}</span>
                <span className="stat-label">Resonance</span>
              </div>
            </div>

            <div className="profile-actions">
              <Link to="/settings" className="btn-profile-edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="profile-section">
          <h2 className="section-title">
            <span className="title-icon">🏆</span>
            ACHIEVEMENTS
          </h2>
          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <span className="achievement-icon">{achievement.icon}</span>
                <span className="achievement-title">{achievement.title}</span>
                {!achievement.unlocked && <div className="lock-overlay">🔒</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transmissions */}
        <div className="profile-section">
          <h2 className="section-title">
            <span className="title-icon">📡</span>
            RECENT TRANSMISSIONS
          </h2>
          <div className="transmissions-list">
            {recentTransmissions.map((transmission) => (
              <div key={transmission.id} className="transmission-card">
                <div className="transmission-header">
                  <div className="transmission-info">
                    <h3 className="transmission-title">{transmission.title}</h3>
                    <div className="transmission-meta">
                      <span className="transmission-type">{transmission.type}</span>
                      <span className="transmission-date">{transmission.date}</span>
                    </div>
                  </div>
                  <Link to="/archive" className="transmission-view-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </Link>
                </div>
                
                <div className="transmission-stats">
                  <div className="transmission-stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>{transmission.likes}</span>
                  </div>
                  <div className="transmission-stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>{transmission.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Link to="/archive" className="view-all-link">
            View All Transmissions →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

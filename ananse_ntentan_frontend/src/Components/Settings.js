import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { preferences, clearPreferences } = usePreferences();
  const [anonymousName, setAnonymousName] = useState('');
  const [savedName, setSavedName] = useState('VoidWanderer');
  const [isEditing, setIsEditing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    if (anonymousName.trim()) {
      setSavedName(anonymousName);
      setAnonymousName('');
      setIsEditing(false);
      console.log('Anonymous name saved:', anonymousName);
    }
  };

  const handleEdit = () => {
    setAnonymousName(savedName);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setAnonymousName('');
    setIsEditing(false);
  };

  const handleRetakeQuiz = () => {
    clearPreferences();
    navigate('/quiz');
  };

  const handleResetPreferences = () => {
    if (showResetConfirm) {
      clearPreferences();
      navigate('/quiz');
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  // Get preference display values
  const getPreferenceLabel = (key, value) => {
    const labels = {
      genre: { scifi: 'Sci-Fi', fantasy: 'Fantasy', horror: 'Horror', romance: 'Romance', adventure: 'Adventure', mystery: 'Mystery' },
      mood: { dark: 'Dark', bright: 'Bright', mysterious: 'Mysterious', intense: 'Intense', calm: 'Calm' },
      artStyle: { comic: 'Bold Comic', noir: 'Noir', watercolor: 'Watercolor', anime: 'Anime', realistic: 'Realistic' },
      pacing: { fast: 'Fast', balanced: 'Balanced', detailed: 'Detailed' },
      tone: { serious: 'Serious', whimsical: 'Whimsical', poetic: 'Poetic', gritty: 'Gritty', uplifting: 'Uplifting' }
    };
    return labels[key]?.[value] || value;
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">VOID SETTINGS</h1>
        
        <div className="settings-content">
          {/* Anonymous Name Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">IDENTITY IN THE VOID</h2>
              <p className="section-description">
                Choose how you appear when casting into the void. Your anonymous name protects your identity while allowing the void to recognize your essence.
              </p>
            </div>

            <div className="setting-item">
              <label className="setting-label">Anonymous Name</label>
              
              {!isEditing ? (
                <div className="saved-name-display">
                  <div className="name-box">
                    <span className="name-icon">✦</span>
                    <span className="name-text">{savedName}</span>
                  </div>
                  <button className="btn-edit" onClick={handleEdit}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                </div>
              ) : (
                <div className="name-editor">
                  <input
                    type="text"
                    className="name-input"
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    placeholder="Enter your void identity..."
                    maxLength={20}
                  />
                  <div className="editor-actions">
                    <button className="btn-save" onClick={handleSave}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Save
                    </button>
                    <button className="btn-cancel" onClick={handleCancel}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <p className="setting-hint">
                This name will appear on all your void transmissions. Choose wisely—the void remembers.
              </p>
            </div>
          </div>

          {/* Story Preferences Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">STORY PREFERENCES</h2>
              <p className="section-description">
                Your calibrated preferences shape how the void interprets your transmissions.
              </p>
            </div>

            {preferences && (
              <div className="preferences-display">
                <div className="preference-grid">
                  <div className="preference-item">
                    <span className="pref-label">Genre</span>
                    <span className="pref-value">{getPreferenceLabel('genre', preferences.genre)}</span>
                  </div>
                  <div className="preference-item">
                    <span className="pref-label">Mood</span>
                    <span className="pref-value">{getPreferenceLabel('mood', preferences.mood)}</span>
                  </div>
                  <div className="preference-item">
                    <span className="pref-label">Art Style</span>
                    <span className="pref-value">{getPreferenceLabel('artStyle', preferences.artStyle)}</span>
                  </div>
                  <div className="preference-item">
                    <span className="pref-label">Pacing</span>
                    <span className="pref-value">{getPreferenceLabel('pacing', preferences.pacing)}</span>
                  </div>
                  <div className="preference-item">
                    <span className="pref-label">Tone</span>
                    <span className="pref-value">{getPreferenceLabel('tone', preferences.tone)}</span>
                  </div>
                </div>

                <button className="btn-recalibrate" onClick={handleRetakeQuiz}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                  </svg>
                  Recalibrate Preferences
                </button>

                <button 
                  className={`btn-reset ${showResetConfirm ? 'confirm' : ''}`}
                  onClick={handleResetPreferences}
                >
                  {showResetConfirm ? '⚠️ Click Again to Confirm Reset' : 'Reset All Preferences'}
                </button>
              </div>
            )}
          </div>

          {/* Additional Settings Placeholder */}
          <div className="settings-section disabled">
            <div className="section-header">
              <h2 className="section-title">TRANSMISSION PREFERENCES</h2>
              <span className="coming-soon-badge">COMING SOON</span>
            </div>
            <div className="setting-item">
              <label className="setting-label">Notification Settings</label>
              <p className="setting-hint">Manage how the void contacts you</p>
            </div>
          </div>

          <div className="settings-section disabled">
            <div className="section-header">
              <h2 className="section-title">PRIVACY & DATA</h2>
              <span className="coming-soon-badge">COMING SOON</span>
            </div>
            <div className="setting-item">
              <label className="setting-label">Data Retention</label>
              <p className="setting-hint">Control what the void remembers</p>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="settings-footer">
          <div className="status-indicator active"></div>
          <span className="status-text">SYSTEM SYNCHRONIZED</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;

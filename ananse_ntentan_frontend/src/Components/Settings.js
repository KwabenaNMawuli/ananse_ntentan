import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [anonymousName, setAnonymousName] = useState('');
  const [savedName, setSavedName] = useState('VoidWanderer');
  const [isEditing, setIsEditing] = useState(false);

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

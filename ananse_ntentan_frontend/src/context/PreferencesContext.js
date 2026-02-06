import React, { createContext, useContext, useState, useEffect } from 'react';

// Generate unique anonymous ID
const generateAnonymousId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `void_${timestamp}_${randomStr}`;
};

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load preferences from localStorage
    const stored = localStorage.getItem('userPreferences');
    let loadedPreferences = null;
    
    if (stored) {
      try {
        loadedPreferences = JSON.parse(stored);
        
        // Ensure user has an anonymous ID
        if (!loadedPreferences.anonymousId) {
          loadedPreferences.anonymousId = generateAnonymousId();
          localStorage.setItem('userPreferences', JSON.stringify(loadedPreferences));
        }
        
        setPreferences(loadedPreferences);
      } catch (error) {
        console.error('Failed to parse preferences:', error);
      }
    } else {
      // First time visitor - generate ID even before quiz
      const anonymousId = generateAnonymousId();
      const initialData = { anonymousId, createdAt: new Date().toISOString() };
      localStorage.setItem('userPreferences', JSON.stringify(initialData));
      setPreferences(initialData);
    }
    
    setLoading(false);
  }, []);

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const clearPreferences = () => {
    setPreferences(null);
    localStorage.removeItem('userPreferences');
  };

  const hasCompletedQuiz = () => {
    return preferences && preferences.completedAt;
  };

  // Map preferences to backend format
  const getPromptModifiers = () => {
    if (!preferences) return [];

    const modifiers = [];

    // Genre modifiers
    const genreMap = {
      scifi: ['futuristic technology', 'space elements', 'advanced civilization'],
      fantasy: ['magical elements', 'mythical creatures', 'epic quest'],
      horror: ['dark atmosphere', 'suspenseful', 'eerie shadows'],
      romance: ['emotional depth', 'intimate moments', 'heartfelt'],
      adventure: ['action-packed', 'heroic', 'dynamic movement'],
      mystery: ['noir atmosphere', 'mysterious', 'detective aesthetic']
    };

    // Mood modifiers
    const moodMap = {
      dark: ['dark tones', 'heavy shadows', 'ominous'],
      bright: ['vibrant colors', 'light-filled', 'optimistic'],
      mysterious: ['enigmatic', 'shrouded in mystery', 'atmospheric'],
      intense: ['dramatic lighting', 'high contrast', 'powerful'],
      calm: ['serene', 'peaceful tones', 'tranquil']
    };

    // Art style modifiers
    const artMap = {
      comic: ['comic book style', 'bold lines', 'vibrant colors'],
      noir: ['noir style', 'black and white', 'high contrast'],
      watercolor: ['watercolor painting', 'soft edges', 'dreamy'],
      anime: ['anime style', 'expressive characters', 'detailed'],
      realistic: ['photorealistic', 'detailed textures', 'lifelike']
    };

    // Tone modifiers
    const toneMap = {
      serious: ['serious tone', 'contemplative', 'profound'],
      whimsical: ['whimsical', 'playful', 'imaginative'],
      poetic: ['poetic', 'lyrical', 'elegant'],
      gritty: ['gritty', 'raw', 'realistic'],
      uplifting: ['uplifting', 'inspiring', 'hopeful']
    };

    if (preferences.genre && genreMap[preferences.genre]) {
      modifiers.push(...genreMap[preferences.genre]);
    }
    if (preferences.mood && moodMap[preferences.mood]) {
      modifiers.push(...moodMap[preferences.mood]);
    }
    if (preferences.artStyle && artMap[preferences.artStyle]) {
      modifiers.push(...artMap[preferences.artStyle]);
    }
    if (preferences.tone && toneMap[preferences.tone]) {
      modifiers.push(...toneMap[preferences.tone]);
    }

    return modifiers;
  };

  // Get panel count based on pacing preference
  const getPanelCount = () => {
    if (!preferences || !preferences.pacing) return { min: 4, max: 6 };

    const pacingMap = {
      fast: { min: 3, max: 4 },
      balanced: { min: 4, max: 6 },
      detailed: { min: 6, max: 8 }
    };

    return pacingMap[preferences.pacing] || { min: 4, max: 6 };
  };

  const value = {
    preferences,
    loading,
    updatePreferences,
    clearPreferences,
    hasCompletedQuiz,
    getPromptModifiers,
    getPanelCount
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export default PreferencesContext;

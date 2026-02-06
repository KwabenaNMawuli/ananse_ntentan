import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import './Quiz.css';

const Quiz = ({ onComplete }) => {
  const navigate = useNavigate();
  const { updatePreferences } = usePreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'genre',
      title: 'What kind of stories speak to you?',
      subtitle: 'Choose the genre that resonates with your soul',
      options: [
        { value: 'scifi', label: 'Sci-Fi & Futuristic', icon: '🚀', description: 'Technology, space, future worlds' },
        { value: 'fantasy', label: 'Fantasy & Magic', icon: '✨', description: 'Magic, mythical creatures, epic quests' },
        { value: 'horror', label: 'Horror & Suspense', icon: '👻', description: 'Fear, mystery, the unknown' },
        { value: 'romance', label: 'Romance & Emotion', icon: '❤️', description: 'Love, relationships, feelings' },
        { value: 'adventure', label: 'Action & Adventure', icon: '⚔️', description: 'Heroes, battles, exploration' },
        { value: 'mystery', label: 'Mystery & Noir', icon: '🔍', description: 'Detective work, puzzles, intrigue' }
      ]
    },
    {
      id: 'mood',
      title: 'What atmosphere draws you in?',
      subtitle: 'Select the mood that captures your essence',
      options: [
        { value: 'dark', label: 'Dark & Moody', icon: '🌑', description: 'Shadows, tension, depth' },
        { value: 'bright', label: 'Bright & Hopeful', icon: '☀️', description: 'Optimism, light, positivity' },
        { value: 'mysterious', label: 'Mysterious & Enigmatic', icon: '🔮', description: 'Secrets, ambiguity, wonder' },
        { value: 'intense', label: 'Intense & Dramatic', icon: '⚡', description: 'High stakes, emotion, power' },
        { value: 'calm', label: 'Calm & Reflective', icon: '🌊', description: 'Peace, introspection, serenity' }
      ]
    },
    {
      id: 'artStyle',
      title: 'Which visual style calls to you?',
      subtitle: 'Pick the artistic direction that moves you',
      options: [
        { value: 'comic', label: 'Bold Comic', icon: '💥', description: 'Vibrant colors, clear lines, dynamic' },
        { value: 'noir', label: 'Noir & Contrast', icon: '🎬', description: 'Black & white, dramatic shadows' },
        { value: 'watercolor', label: 'Soft Watercolor', icon: '🎨', description: 'Dreamy, fluid, artistic' },
        { value: 'anime', label: 'Anime Inspired', icon: '🌸', description: 'Expressive, detailed, emotional' },
        { value: 'realistic', label: 'Realistic & Detailed', icon: '📷', description: 'Photographic, lifelike, immersive' }
      ]
    },
    {
      id: 'pacing',
      title: 'How do you prefer your stories told?',
      subtitle: 'Choose the narrative rhythm that suits you',
      options: [
        { value: 'fast', label: 'Fast & Intense', icon: '⚡', description: '3-4 panels, quick progression' },
        { value: 'balanced', label: 'Balanced & Flowing', icon: '🌊', description: '4-6 panels, steady pace' },
        { value: 'detailed', label: 'Detailed & Immersive', icon: '📖', description: '6-8 panels, rich storytelling' }
      ]
    },
    {
      id: 'tone',
      title: 'What tone resonates with you?',
      subtitle: 'Select the voice that speaks to your spirit',
      options: [
        { value: 'serious', label: 'Serious & Profound', icon: '🎭', description: 'Deep, meaningful, contemplative' },
        { value: 'whimsical', label: 'Whimsical & Playful', icon: '🦋', description: 'Light, creative, imaginative' },
        { value: 'poetic', label: 'Poetic & Lyrical', icon: '✒️', description: 'Elegant, flowing, beautiful' },
        { value: 'gritty', label: 'Gritty & Raw', icon: '🗡️', description: 'Realistic, harsh, unfiltered' },
        { value: 'uplifting', label: 'Uplifting & Inspiring', icon: '🌟', description: 'Hopeful, motivating, positive' }
      ]
    }
  ];

  const handleSelect = (value) => {
    const currentQuestion = questions[currentStep];
    setAnswers({ ...answers, [currentQuestion.id]: value });

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      // Quiz complete
      setTimeout(() => {
        const preferences = {
          ...answers,
          [currentQuestion.id]: value,
          completedAt: new Date().toISOString()
        };
        
        // Update context (which also saves to localStorage)
        updatePreferences(preferences);
        
        // Navigate to home
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }, 300);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipQuiz = () => {
    const defaultPreferences = {
      genre: 'adventure',
      mood: 'mysterious',
      artStyle: 'comic',
      pacing: 'balanced',
      tone: 'serious',
      completedAt: new Date().toISOString(),
      skipped: true
    };
    
    // Update context (which also saves to localStorage)
    updatePreferences(defaultPreferences);
    
    // Navigate to home
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 100);
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-background"></div>
      
      <div className="quiz-content">
        {/* Header */}
        <div className="quiz-header">
          <h1 className="quiz-welcome">CALIBRATE YOUR VOID</h1>
          <p className="quiz-intro">Help us understand the stories that echo within you</p>
          
          {/* Progress Bar */}
          <div className="quiz-progress-container">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="quiz-progress-text">
              {currentStep + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="quiz-question" key={currentStep}>
          <h2 className="question-title">{currentQuestion.title}</h2>
          <p className="question-subtitle">{currentQuestion.subtitle}</p>

          {/* Options */}
          <div className={`quiz-options ${currentQuestion.options.length > 4 ? 'grid-3' : 'grid-2'}`}>
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                className={`quiz-option ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                <span className="option-description">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          {currentStep > 0 && (
            <button className="quiz-nav-btn back" onClick={goBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Back
            </button>
          )}
          
          <button className="quiz-nav-btn skip" onClick={skipQuiz}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

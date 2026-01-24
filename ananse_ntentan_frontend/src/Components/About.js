import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">ABOUT THE VOID</h1>
        
        <div className="about-content">
          <p className="about-text">
            Ananse Ntentan is an experimental platform where creativity meets the unknown. 
            Cast your fragments—voice, text, or sketches—into the Void and watch as they're 
            transformed into something new. Each submission becomes part of a collective 
            consciousness, reimagined through AI interpretation and shared with the community. 
            Your thoughts echo across the digital abyss, creating unexpected connections and 
            narratives. The Void listens, transforms, and remembers. What will you offer to 
            the infinite?
          </p>
          
          <div className="about-stats">
            <div className="stat-box">
              <span className="stat-number">∞</span>
              <span className="stat-label">TRANSMISSIONS PROCESSED</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">24/7</span>
              <span className="stat-label">VOID AVAILABILITY</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">100%</span>
              <span className="stat-label">TRANSFORMATION RATE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

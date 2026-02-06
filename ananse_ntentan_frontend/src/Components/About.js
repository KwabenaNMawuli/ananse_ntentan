import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">ECHOES OF ANANSE'S VOID</h1>
        
        <div className="about-content">
          <section className="vision-section">
            <h2 className="section-title">Our Vision</h2>
            <p className="about-text">
              Stories have always been humanity's bridge between worlds—connecting hearts, 
              transcending time, and making sense of the chaos around us. Ananse Ntentan 
              reimagines storytelling for a new era, where artificial intelligence becomes 
              not a replacement for human creativity, but a companion in the eternal dance 
              of narrative creation.
            </p>
          </section>

          <section className="mission-section">
            <h2 className="section-title">The Power of AI-Enhanced Narrative</h2>
            <p className="about-text">
              We believe that stories are humanity's oldest technology—our way of making sense of 
              existence, sharing wisdom, and connecting across the void of isolation. This platform 
              harnesses the transformative power of AI to democratize storytelling, allowing anyone 
              to cast their raw thoughts, emotions, and visions into visual narratives.
            </p>
            <p className="about-text">
              Through your voice, your text, your sketches—the AI doesn't just generate stories. 
              It listens deeply, interprets authentically, and weaves your essence into visual 
              narratives that honor your intent while surprising you with possibilities you hadn't 
              imagined. Each transmission becomes a collaborative act between human soul and 
              machine intelligence.
            </p>
          </section>

          <section className="purpose-section">
            <h2 className="section-title">Why We Create</h2>
            <p className="about-text">
              In an age of isolation and information overload, we're building spaces for genuine 
              creative expression. This is more than a platform—it's a sanctuary where:
            </p>
            <ul className="purpose-list">
              <li><strong>Your voice matters:</strong> No artistic skill required. Your raw ideas are enough.</li>
              <li><strong>AI amplifies, not replaces:</strong> Technology serves your vision, turning fragments into fully realized stories.</li>
              <li><strong>Community forms anonymously:</strong> Connect with fellow wanderers through shared narratives, free from judgment.</li>
              <li><strong>Stories evolve organically:</strong> Each tale adapts to your unique aesthetic preferences and emotional resonance.</li>
              <li><strong>The void echoes back:</strong> What you transmit transforms and returns, enriched by AI interpretation.</li>
            </ul>
          </section>

          <section className="future-section">
            <h2 className="section-title">The Future We're Building</h2>
            <p className="about-text">
              We envision a world where storytelling transcends barriers—where language, artistic 
              ability, and technical knowledge no longer limit who gets to create. Where AI becomes 
              the bridge between imagination and expression. Where the timeless art of storytelling 
              meets cutting-edge technology to birth something entirely new.
            </p>
            <p className="about-text">
              Every transmission you make isn't just content—it's a thread in the ever-expanding 
              tapestry of human experience. Together, we're proving that technology and humanity need 
              not be adversaries, but partners in the timeless quest to tell stories that matter.
            </p>
          </section>

          <div className="closing-text">
            <p className="about-text">
              <em>The Void awaits your transmission. What story will you weave today?</em>
            </p>
          </div>
          
          <div className="about-stats">
            <div className="stat-box">
              <span className="stat-number">∞</span>
              <span className="stat-label">STORIES WAITING TO BE TOLD</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">AI + YOU</span>
              <span className="stat-label">COLLABORATIVE CREATION</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">24/7</span>
              <span className="stat-label">CREATIVE SANCTUARY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

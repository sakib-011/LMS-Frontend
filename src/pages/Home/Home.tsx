import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import './Home.css';

export const Home: React.FC = () => {
  return (
    <div className="bg-home">
      {/* Dynamic Hero Section */}
      <section className="bg-hero">
        <div className="container">
          <h1 className="bg-hero-title">
            Your Modern Library
          </h1>
          <p className="bg-hero-subtitle">
            "I have always imagined that Paradise will be a kind of library." — Jorge Luis Borges. 
            <br/><br/>
            Step into a sanctuary where a deep love for literature meets the cutting edge of modern technology.
          </p>
          <div className="bg-hero-actions">
            <Link to="/books" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">Explore Catalog</Button>
            </Link>
            <Button variant="outline" size="lg">How it Works</Button>
          </div>
        </div>
      </section>

      {/* Modern Bento Grid Features */}
      <section className="bg-bento-section">
        <div className="container">
          <div className="bg-bento-header">
            <h2>Everything you need, in one place.</h2>
          </div>
          
          <div className="bg-bento-grid">
            {/* Feature 1: Wide */}
            <Link to="/books" className="bg-bento-card wide">
              <div className="bg-bento-icon"><i className="fas fa-search"></i></div>
              <h3 className="bg-bento-title">Intelligent Discovery</h3>
              <p className="bg-bento-text">Instantly search through thousands of physical and digital resources using our blazing fast catalog search with advanced filtering.</p>
              <i className="fas fa-books bg-bento-illustration"></i>
            </Link>

            {/* Feature 2: Standard */}
            <div className="bg-bento-card">
              <div className="bg-bento-icon"><i className="fas fa-calendar-check"></i></div>
              <h3 className="bg-bento-title">Smart Reservations</h3>
              <p className="bg-bento-text">Place holds on physical books and pick them up at your convenience.</p>
              <i className="fas fa-bookmark bg-bento-illustration"></i>
            </div>

            {/* Feature 3: Tall */}
            <div className="bg-bento-card tall">
              <div className="bg-bento-icon"><i className="fas fa-chart-pie"></i></div>
              <h3 className="bg-bento-title">Reading Analytics</h3>
              <p className="bg-bento-text">Track your reading habits, monitor your progress, and get personalized recommendations based on your major and history.</p>
              <i className="fas fa-chart-line bg-bento-illustration" style={{ bottom: '20px', right: '0' }}></i>
            </div>

            {/* Feature 4: Standard */}
            <div className="bg-bento-card">
              <div className="bg-bento-icon"><i className="fas fa-mobile-alt"></i></div>
              <h3 className="bg-bento-title">Cross-Device</h3>
              <p className="bg-bento-text">Access your library seamlessly from your laptop, tablet, or smartphone.</p>
              <i className="fas fa-laptop bg-bento-illustration"></i>
            </div>

            {/* Feature 5: Wide */}
            <div className="bg-bento-card wide">
              <div className="bg-bento-icon"><i className="fas fa-code-branch"></i></div>
              <h3 className="bg-bento-title">API First Architecture</h3>
              <p className="bg-bento-text">Build your own integrations and student tools utilizing our comprehensive and well-documented RESTful API platform.</p>
              <i className="fas fa-server bg-bento-illustration"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Ecosystem (Glassmorphism) */}
      <section className="bg-ecosystem">
        <div className="container bg-eco-grid">
          <div className="bg-eco-content">
            <h2>Immersive Digital Reading.</h2>
            <p>Our integrated digital reader brings your library into the modern age. Highlight, annotate, and pick up right where you left off across all your devices—completely offline.</p>
            <p>Experience typography that adapts to you, dark mode for late night studying, and seamless export of your highlights directly to your notes app.</p>
          </div>
          
          <div className="bg-eco-visual">
            <div className="bg-glass-panel">
              <div className="bg-glass-header">
                <div className="bg-glass-dot"></div>
                <div className="bg-glass-dot"></div>
                <div className="bg-glass-dot"></div>
              </div>
              <div className="bg-glass-body">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
                <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco <span className="bg-glass-highlight">laboris nisi ut aliquip</span> ex ea commodo consequat.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bold CTA */}
      <section className="bg-cta-modern">
        <div className="container">
          <h2>Ready to revolutionize your study flow?</h2>
          <p>Join thousands of students and researchers using BookGrid to manage their academic resources today.</p>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

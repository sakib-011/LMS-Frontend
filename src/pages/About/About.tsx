import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '../../components/ui';
import './About.css';

export const About: React.FC = () => {
  return (
    <div className="bg-about">
      <div className="bg-about-hero">
        <div className="container">
          <h1>About BookGrid</h1>
          <p>
            Reimagining academic resource management for modern campus communities.
          </p>
        </div>
      </div>

      <div className="container bg-about-content">
        <div className="bg-about-grid">
          <div className="bg-about-card">
            <h3><i className="fas fa-bullseye"></i> Our Mission</h3>
            <p>
              BookGrid was designed to streamline the way students and faculty discover, access, and interact with educational materials. We believe that access to knowledge should be effortless, intuitive, and seamlessly integrated into digital learning workflows.
            </p>
          </div>

          <div className="bg-about-card">
            <h3><i className="fas fa-eye"></i> Our Vision</h3>
            <p>
              To create an interconnected library ecosystem where physical collections meet instant digital accessibility. BookGrid empowers academic institutions to maximize their resources while delivering a modern, delightful reading experience.
            </p>
          </div>
        </div>

        <div className="bg-about-stats">
          <div>
            <div className="bg-stat-num">50,000+</div>
            <div className="bg-stat-label">Cataloged Volumes</div>
          </div>
          <div>
            <div className="bg-stat-num">12,000+</div>
            <div className="bg-stat-label">Active Readers</div>
          </div>
          <div>
            <div className="bg-stat-num">99.8%</div>
            <div className="bg-stat-label">Uptime & Availability</div>
          </div>
          <div>
            <div className="bg-stat-num">24/7</div>
            <div className="bg-stat-label">Digital Access</div>
          </div>
        </div>

        <div className="bg-hiw-cta-box" style={{ marginTop: 0 }}>
          <h2>Experience BookGrid Today</h2>
          <p>Get instant access to thousands of textbooks, journals, and literature.</p>
          <div className="bg-hiw-cta-btns">
            <RouterLink to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">Get Started</Button>
            </RouterLink>
            <RouterLink to="/books" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="lg">Explore Library</Button>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  );
};

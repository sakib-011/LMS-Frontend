import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import './Categories.css';

const CATEGORIES = [
  { name: 'Computer Science', icon: 'fa-laptop-code', count: 1245 },
  { name: 'Engineering', icon: 'fa-cogs', count: 832 },
  { name: 'Business', icon: 'fa-briefcase', count: 654 },
  { name: 'Mathematics', icon: 'fa-square-root-alt', count: 421 },
  { name: 'Science', icon: 'fa-flask', count: 987 },
  { name: 'Literature', icon: 'fa-feather', count: 1450 },
  { name: 'History', icon: 'fa-landmark', count: 765 },
  { name: 'Arts', icon: 'fa-palette', count: 320 },
];

export const Categories: React.FC = () => {
  return (
    <div className="bg-public-cats">
      <div className="bg-public-cats-header">
        <div className="container">
          <h1>Library Collections</h1>
          <p>Explore our vast academic collections organized by discipline.</p>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--space-12) 0', position: 'relative' }}>
        <div className="bg-public-cats-grid">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="bg-public-cat-card">
              <i className={`fas ${cat.icon} bg-public-cat-icon`}></i>
              <h3 className="bg-public-cat-title">{cat.name}</h3>
              <p className="bg-public-cat-count">{cat.count.toLocaleString()} Volumes</p>
            </div>
          ))}
        </div>

        {/* Lock Overlay for non-logged in users */}
        <div className="bg-public-books-overlay">
          <div className="bg-public-books-lock-card">
            <i className="fas fa-lock"></i>
            <h2>Deep Dive into Collections</h2>
            <p>Login to browse specific collections, filter by category, and find exactly what you need for your research.</p>
            <div className="bg-public-books-actions">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg">Login</Button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="lg">Create Free Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

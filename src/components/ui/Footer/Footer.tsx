import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-footer">
      <div className="container">
        <div className="bg-footer-content">
          <div className="bg-footer-brand">
            <div className="bg-footer-logo">
              <i className="fas fa-book bg-footer-logo-icon"></i>
              <span className="bg-footer-logo-text">BookGrid</span>
            </div>
            <p className="bg-footer-desc">
              Your modern academic library platform and digital ecosystem.
            </p>
          </div>
          <div className="bg-footer-links">
            <div className="bg-footer-link-group">
              <h4 className="bg-footer-heading">Platform</h4>
              <Link to="/books">Browse Library</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/about">About Us</Link>
            </div>
            <div className="bg-footer-link-group">
              <h4 className="bg-footer-heading">Account</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Create Account</Link>
            </div>
          </div>
        </div>
        <div className="bg-footer-bottom">
          <p>&copy; {new Date().getFullYear()} BookGrid. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

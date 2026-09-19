import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import './HowItWorks.css';

const STEPS = [
  {
    num: "Step 01",
    title: "Discover & Search",
    icon: "fa-search",
    desc: "Search through thousands of physical and digital books across various academic disciplines with real-time availability status."
  },
  {
    num: "Step 02",
    title: "Reserve or Read Digital",
    icon: "fa-book-open",
    desc: "Instantly reserve physical copies for quick campus library pickup, or dive straight into digital e-books from your web browser."
  },
  {
    num: "Step 03",
    title: "Track & Renew easily",
    icon: "fa-clock",
    desc: "Monitor due dates, manage renewals in one click, and organize your research reading lists from a unified student dashboard."
  },
  {
    num: "Step 04",
    title: "Review & Engage",
    icon: "fa-comments",
    desc: "Share notes, rate books, and engage with campus peers to build a collaborative learning ecosystem."
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <div className="bg-how-it-works">
      <div className="bg-hiw-hero">
        <div className="container">
          <h1>How BookGrid Works</h1>
          <p>
            Experience a seamless bridge between traditional library archives and modern digital reading.
          </p>
        </div>
      </div>

      <div className="container bg-hiw-steps-section">
        <div className="bg-hiw-grid">
          {STEPS.map((step, index) => (
            <div key={index} className="bg-hiw-step-card">
              <span className="bg-hiw-step-num">{step.num}</span>
              <i className={`fas ${step.icon} bg-hiw-step-icon`}></i>
              <h3 className="bg-hiw-step-title">{step.title}</h3>
              <p className="bg-hiw-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-hiw-cta-box">
          <h2>Ready to Supercharge Your Academic Journey?</h2>
          <p>Join thousands of students and faculty members who rely on BookGrid every day.</p>
          <div className="bg-hiw-cta-btns">
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">Create Free Account</Button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

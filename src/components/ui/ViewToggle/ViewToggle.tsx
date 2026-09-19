import React from 'react';
import './ViewToggle.css';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onChange: (v: 'grid' | 'list') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => (
  <div className="vt-wrap">
    <button
      className={`vt-btn ${view === 'grid' ? 'vt-btn--active' : ''}`}
      onClick={() => onChange('grid')}
      title="Grid view"
    >
      <i className="fas fa-th"></i>
    </button>
    <button
      className={`vt-btn ${view === 'list' ? 'vt-btn--active' : ''}`}
      onClick={() => onChange('list')}
      title="List view"
    >
      <i className="fas fa-list"></i>
    </button>
  </div>
);

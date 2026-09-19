import React from 'react';
import { Badge } from '../Badge/Badge';
import './BookCard.css';

export interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  category?: string;
  status?: 'Available' | 'Checked Out' | 'Reserved';
  onClick?: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  coverImage,
  category,
  status = 'Available',
  onClick
}) => {
  const getStatusVariant = () => {
    switch (status) {
      case 'Available': return 'success';
      case 'Checked Out': return 'error';
      case 'Reserved': return 'secondary';
      default: return 'neutral';
    }
  };

  return (
    <div className="bg-bookcard" onClick={() => onClick && onClick(id)}>
      <div className="bg-bookcard-cover-wrapper">
        {coverImage ? (
          <img src={coverImage} alt={title} className="bg-bookcard-cover" />
        ) : (
          <div className="bg-bookcard-placeholder">
            <i className="fas fa-book-open"></i>
          </div>
        )}
        <div className="bg-bookcard-badge-container">
          <Badge variant={getStatusVariant()} size="sm">{status}</Badge>
        </div>
      </div>
      <div className="bg-bookcard-content">
        {category && <span className="bg-bookcard-category">{category}</span>}
        <h3 className="bg-bookcard-title" title={title}>{title}</h3>
        <p className="bg-bookcard-author">{author}</p>
      </div>
    </div>
  );
};

import React from 'react';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-pagination">
      <button 
        className="bg-pagination-btn" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          className={`bg-pagination-btn ${currentPage === page ? 'bg-pagination-btn--active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button 
        className="bg-pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

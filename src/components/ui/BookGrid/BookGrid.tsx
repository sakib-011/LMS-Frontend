import React from 'react';
import './BookGrid.css';

export interface BookGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
}

export const BookGrid: React.FC<BookGridProps> = ({ children, columns = 4 }) => {
  return (
    <div className={`bg-bookgrid bg-bookgrid--cols-${columns}`}>
      {children}
    </div>
  );
};

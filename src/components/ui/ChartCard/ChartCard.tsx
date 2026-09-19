import React from 'react';
import './ChartCard.css';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-chartcard">
      <div className="bg-chartcard-header">
        <h4 className="bg-chartcard-title">{title}</h4>
        {subtitle && <p className="bg-chartcard-subtitle">{subtitle}</p>}
      </div>
      <div className="bg-chartcard-content">
        {children}
      </div>
    </div>
  );
};

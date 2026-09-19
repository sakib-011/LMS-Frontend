import React from 'react';
import { Link } from 'react-router-dom';
import './StatCard.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  to?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, to }) => {
  const content = (
    <>
      <div className="bg-statcard-header">
        <h4 className="bg-statcard-title">{title}</h4>
        {icon && (
          <div className="bg-statcard-icon-wrapper">
            <i className={`${icon} bg-statcard-icon`}></i>
          </div>
        )}
      </div>
      <div className="bg-statcard-content">
        <span className="bg-statcard-value">{value}</span>
        {trend && (
          <div className={`bg-statcard-trend ${trend.isPositive ? 'bg-statcard-trend--pos' : 'bg-statcard-trend--neg'}`}>
            <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'}`}></i>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="bg-statcard" style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-statcard">
      {content}
    </div>
  );
};

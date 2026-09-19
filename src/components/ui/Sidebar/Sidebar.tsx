import React from 'react';
import './Sidebar.css';

export interface SidebarItem {
  icon: string;
  label: string;
  href: string;
  isActive?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, onItemClick }) => {
  return (
    <aside className="bg-sidebar">
      <ul className="bg-sidebar-nav">
        {items.map((item, index) => (
          <li key={index} className="bg-sidebar-item">
            <a 
              href={item.href}
              className={`bg-sidebar-link ${item.isActive ? 'bg-sidebar-link--active' : ''}`}
              onClick={(e) => {
                if (onItemClick) {
                  e.preventDefault();
                  onItemClick(item);
                }
              }}
            >
              <i className={`${item.icon} bg-sidebar-icon`}></i>
              <span className="bg-sidebar-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

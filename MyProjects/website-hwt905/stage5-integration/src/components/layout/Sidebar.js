/**
 * GIAI ĐOẠN 3: SIDEBAR COMPONENT  
 * Chương 6: React Component, Conditional Rendering, Event Handling
 * Chuyển từ stage2 HTML/JS sang React
 */

import React from 'react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, connectionStatus } = useApp();

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      active: true
    },
    {
      label: 'Biểu đồ',
      path: '/charts',
      active: false
    },
    {
      label: 'Lịch sử',
      path: '/history',
      active: false
    },
    {
      label: 'Cài đặt',
      path: '/settings',
      active: false
    }
  ];

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const handleMenuClick = (item) => {
    console.log(`Navigating to ${item.path}`);
    // Giai đoạn 3 sẽ có React Router navigation thật
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div 
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Điều hướng</h3>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li 
                key={index}
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                <div
                  className="nav-link"
                  onClick={() => handleMenuClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleMenuClick(item);
                    }
                  }}
                >
                  <span className="nav-text">{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="connection-status">
            <div 
              className={`status-indicator ${connectionStatus}`}
            />
            <span className="status-text">
              {connectionStatus === 'online' ? 'Đã kết nối' : 'Mất kết nối'}
            </span>
          </div>
          <div className="version-info">v1.0.0</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

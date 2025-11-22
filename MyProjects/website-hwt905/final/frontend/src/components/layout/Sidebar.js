/**
 * GIAI ĐOẠN 3: SIDEBAR COMPONENT  
 * Chương 6: React Component, Conditional Rendering, Event Handling
 * Chuyển từ stage2 HTML/JS sang React
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, connectionStatus } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      label: 'Biểu đồ',
      path: '/charts'
    },
    {
      label: 'Lịch sử',
      path: '/history'
    },
    {
      label: 'Quản lý dự án',
      path: '/projects'
    },
    {
      label: 'Cài đặt',
      path: '/settings'
    }
  ];

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const handleMenuClick = (item) => {
    navigate(item.path);
    // Close sidebar on mobile after navigation
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
      
      <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3>Điều hướng</h3>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li 
                key={index}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
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
            <div className="status-indicator">
              <div className={`status-dot ${connectionStatus}`} />
              <span className="status-text">
                {connectionStatus === 'online' ? 'Đã kết nối' : 'Mất kết nối'}
              </span>
            </div>
          </div>
          <div className="version-info">v1.0.0</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

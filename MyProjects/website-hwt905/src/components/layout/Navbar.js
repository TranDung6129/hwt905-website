/**
 * GIAI ĐOẠN 6: NAVBAR COMPONENT với Authentication
 * Chương 6: Layout Component với User Menu và Logout
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import RealTimeIndicator from '../common/RealTimeIndicator';
import NotificationCenter from '../dashboard/NotificationCenter';

const Navbar = () => {
  const { user, logout, hasPermission, PERMISSIONS } = useAuth();
  const { toggleSidebar } = useAppContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  /**
   * Close user menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  /**
   * Get user display name
   */
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.username || user.email || 'User';
  };

  /**
   * Get user role badge color
   */
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#e74c3c';
      case 'operator': return '#f39c12';
      case 'user': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <nav className="navbar">
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-bottom: 2px solid #e1e8ed;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .menu-toggle {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .menu-toggle:hover {
          background: #f8f9fa;
        }

        .menu-toggle span {
          display: block;
          width: 20px;
          height: 2px;
          background: #2c3e50;
          transition: all 0.3s;
          transform-origin: center;
        }

        .menu-toggle span:not(:last-child) {
          margin-bottom: 4px;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          color: #2c3e50;
          text-decoration: none;
        }

        .logo-icon {
          font-size: 24px;
        }

        .logo-text {
          font-size: 18px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .notification-bell {
          position: relative;
          padding: 8px;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .notification-bell:hover {
          background: #f8f9fa;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: #e74c3c;
          border-radius: 50%;
        }

        .user-menu {
          position: relative;
        }

        .user-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .user-button:hover {
          background: #f8f9fa;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3498db, #2c3e50);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .user-name {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
          line-height: 1.2;
        }

        .user-role {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 10px;
          color: white;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dropdown-arrow {
          font-size: 12px;
          color: #7f8c8d;
          transition: transform 0.2s;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 200px;
          z-index: 1001;
          margin-top: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
        }

        .user-dropdown.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-header {
          padding: 16px;
          border-bottom: 1px solid #e1e8ed;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }

        .dropdown-user-name {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        .dropdown-user-email {
          font-size: 13px;
          color: #7f8c8d;
        }

        .dropdown-menu {
          padding: 8px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #2c3e50;
          text-decoration: none;
          font-size: 14px;
          transition: background-color 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .dropdown-item:hover {
          background: #f8f9fa;
        }

        .dropdown-item.danger {
          color: #e74c3c;
        }

        .dropdown-item.danger:hover {
          background: #fdf2f2;
        }

        .dropdown-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .dropdown-divider {
          height: 1px;
          background: #e1e8ed;
          margin: 8px 0;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 15px;
          }

          .logo-text {
            display: none;
          }

          .user-info {
            display: none;
          }

          .notification-bell {
            display: none;
          }
        }
      `}</style>

      {/* Left Section */}
      <div className="navbar-left">
        <button 
          className="menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <a href="/dashboard" className="navbar-logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">IoT Dashboard</span>
        </a>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Real-time Connection Indicator */}
        <RealTimeIndicator />

        {/* Real-time Notification Center */}
        <NotificationCenter />

        {/* User Menu */}
        <div className="user-menu" ref={userMenuRef}>
          <button 
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <div className="user-avatar">
              {getUserDisplayName().charAt(0).toUpperCase()}
            </div>
            
            <div className="user-info">
              <div className="user-name">{getUserDisplayName()}</div>
              <div 
                className="user-role" 
                style={{ background: getRoleBadgeColor(user?.role) }}
              >
                {user?.role || 'user'}
              </div>
            </div>

            <span className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}>
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          <div className={`user-dropdown ${showUserMenu ? 'show' : ''}`}>
            <div className="dropdown-header">
              <div className="dropdown-user-name">{getUserDisplayName()}</div>
              <div className="dropdown-user-email">{user?.email}</div>
            </div>

            <div className="dropdown-menu">
              <button className="dropdown-item">
                <span className="dropdown-icon">👤</span>
                <span>Thông tin cá nhân</span>
              </button>

              <button className="dropdown-item">
                <span className="dropdown-icon">⚙️</span>
                <span>Cài đặt</span>
              </button>

              {hasPermission(PERMISSIONS.MANAGE_USERS) && (
                <button className="dropdown-item">
                  <span className="dropdown-icon">👥</span>
                  <span>Quản lý người dùng</span>
                </button>
              )}

              {hasPermission(PERMISSIONS.MANAGE_DEVICES) && (
                <button className="dropdown-item">
                  <span className="dropdown-icon">📱</span>
                  <span>Quản lý thiết bị</span>
                </button>
              )}

              <div className="dropdown-divider"></div>

              <button className="dropdown-item">
                <span className="dropdown-icon">❓</span>
                <span>Trợ giúp</span>
              </button>

              <div className="dropdown-divider"></div>

              <button 
                className="dropdown-item danger"
                onClick={handleLogout}
              >
                <span className="dropdown-icon">🚪</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

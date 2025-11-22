/**
 * REDESIGNED NAVBAR COMPONENT
 * Compact navbar with hamburger menu for user actions
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const Navbar = () => {
  const { toggleSidebar } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('sensor_dashboard_token');
    window.location.href = '/login';
  };

  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Demo User"}');

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-menu-container')) {
      setUserMenuOpen(false);
    }
  };

  React.useEffect(() => {
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  return (
    <nav className="navbar-compact">
      <div className="navbar-left">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="navbar-right">
        <div className="user-menu-container">
          <button 
            className="user-menu-trigger"
            onClick={toggleUserMenu}
            aria-label="User menu"
          >
            Menu
          </button>
          
          {userMenuOpen && (
            <div className="user-dropdown-menu">
              <div className="user-info">
                <span className="username">{user.username}</span>
              </div>
              <div className="menu-divider"></div>
              <button className="menu-item">Thông tin cá nhân</button>
              <button className="menu-item">Cài đặt tài khoản</button>
              <div className="menu-divider"></div>
              <button className="menu-item logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

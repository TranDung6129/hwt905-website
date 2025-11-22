/**
 * GIAI ĐOẠN 8: NOTIFICATION CENTER COMPONENT
 * Real-time notifications từ WebSocket
 */

import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useSocket';

const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, alerts

  /**
   * Filter notifications based on selected filter
   */
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'alerts':
        return notification.type === 'alert';
      default:
        return true;
    }
  });

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'alert': return '🚨';
      case 'info':
      default: return 'ℹ️';
    }
  };

  /**
   * Get time ago string
   */
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  /**
   * Handle notification click
   */
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="notification-center">
      <style>{`
        .notification-center {
          position: relative;
        }

        .notification-bell {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-bell:hover {
          background: #f8f9fa;
        }

        .notification-bell.has-unread {
          animation: bell-shake 2s infinite;
        }

        .bell-icon {
          font-size: 20px;
          color: #6c757d;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: badge-pulse 1.5s infinite;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          width: 320px;
          max-height: 400px;
          z-index: 1000;
          margin-top: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
        }

        .notification-dropdown.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-header {
          padding: 16px;
          border-bottom: 1px solid #dee2e6;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }

        .dropdown-title {
          font-size: 16px;
          font-weight: 600;
          color: #495057;
          margin-bottom: 8px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .filter-tab {
          padding: 4px 8px;
          background: none;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .dropdown-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .action-btn {
          padding: 4px 8px;
          background: none;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #e9ecef;
        }

        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f8f9fa;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item.unread {
          background: #f0f8ff;
          border-left: 3px solid #007bff;
        }

        .notification-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-content {
          flex: 1;
        }

        .notification-message {
          font-size: 14px;
          color: #495057;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .notification-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #6c757d;
        }

        .notification-time {
          font-size: 11px;
        }

        .notification-from {
          font-weight: 500;
        }

        .empty-state {
          padding: 32px 16px;
          text-align: center;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        @keyframes bell-shake {
          0%, 50%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-10deg); }
          20%, 40% { transform: rotate(10deg); }
        }

        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @media (max-width: 768px) {
          .notification-dropdown {
            width: 280px;
            right: -20px;
          }
        }
      `}</style>

      {/* Notification Bell */}
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <div className={`notification-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="dropdown-header">
          <div className="dropdown-title">
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </div>
          
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
            <button 
              className={`filter-tab ${filter === 'alerts' ? 'active' : ''}`}
              onClick={() => setFilter('alerts')}
            >
              Alerts
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="dropdown-actions">
              <button className="action-btn" onClick={markAllAsRead}>
                Mark all read
              </button>
              <button className="action-btn" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <div>No notifications</div>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-meta">
                    <span className="notification-from">
                      {notification.from ? `From: ${notification.from}` : 'System'}
                    </span>
                    <span className="notification-time">
                      {getTimeAgo(notification.receivedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="notification-backdrop"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'transparent'
          }}
        />
      )}
    </div>
  );
};

export default NotificationCenter;

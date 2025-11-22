/**
 * GIAI ĐOẠN 3: NOTIFICATION COMPONENT
 * Chương 6: React Component, useEffect, Conditional Rendering
 * Chuyển từ stage2 showNotification function sang React component
 */

import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const Notification = () => {
  const { notifications, removeNotification } = useApp();

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000 }}>
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  useEffect(() => {
    // Auto remove after 3 seconds
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  const handleClick = () => {
    onRemove(notification.id);
  };

  return (
    <div 
      className={`notification ${notification.type}`}
      onClick={handleClick}
      style={{
        marginBottom: '10px',
        cursor: 'pointer',
        maxWidth: '300px'
      }}
    >
      {notification.message}
    </div>
  );
};

export default Notification;

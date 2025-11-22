/**
 * GIAI ĐOẠN 8: REACT WEBSOCKET HOOK
 * Custom hook for managing WebSocket connections in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for WebSocket connection management
 */
export const useSocket = () => {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [lastData, setLastData] = useState(null);
  const connectionAttempted = useRef(false);

  /**
   * Handle connection status changes
   */
  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected);
    setConnectionStatus(connected ? 'connected' : 'disconnected');
    if (connected) {
      setError(null);
    }
  }, []);

  /**
   * Handle connection errors
   */
  const handleError = useCallback((error) => {
    setError(error);
    setConnectionStatus('error');
    console.error('Socket connection error:', error);
  }, []);

  /**
   * Initialize WebSocket connection
   */
  const connect = useCallback(async () => {
    if (!isAuthenticated || connectionAttempted.current) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      connectionAttempted.current = true;
      
      await socketService.autoConnect();
      handleConnectionChange(true);
      
    } catch (error) {
      handleError(error);
      connectionAttempted.current = false;
    }
  }, [isAuthenticated, handleConnectionChange, handleError]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    socketService.disconnect();
    handleConnectionChange(false);
    connectionAttempted.current = false;
  }, [handleConnectionChange]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const handleConnected = (data) => {
      handleConnectionChange(true);
      console.log('WebSocket connected:', data);
    };

    const handleDisconnected = (data) => {
      handleConnectionChange(false);
      connectionAttempted.current = false;
      console.log('WebSocket disconnected:', data);
    };

    const handleSocketError = (error) => {
      handleError(error);
    };

    // Add event listeners
    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('error', handleSocketError);

    // Cleanup on unmount
    return () => {
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
      socketService.off('error', handleSocketError);
    };
  }, [handleConnectionChange, handleError]);

  /**
   * Auto-connect when authenticated
   */
  useEffect(() => {
    if (isAuthenticated && !connectionAttempted.current) {
      connect();
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, isConnected, connect, disconnect]);

  /**
   * Auto-disconnect on user change or logout
   */
  useEffect(() => {
    return () => {
      if (connectionAttempted.current) {
        disconnect();
      }
    };
  }, [user?.id, disconnect]);

  return {
    isConnected,
    connectionStatus,
    error,
    lastData,
    connect,
    disconnect,
    socket: socketService
  };
};

/**
 * Hook for subscribing to real-time IMU/SHM data
 */
export const useIMUData = (deviceId = null) => {
  const { socket, isConnected } = useSocket();
  const [imuData, setIMUData] = useState(null);
  const [shmData, setSHMData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Handle incoming IMU/SHM data
   */
  const handleIMUData = useCallback((data) => {
    if (!deviceId || data.deviceId === deviceId) {
      setIMUData(data.data.imu);
      setSHMData(data.data.shm);
      setLastUpdated(new Date());
    }
  }, [deviceId]);

  /**
   * Subscribe to device data on connection
   */
  useEffect(() => {
    if (isConnected && deviceId) {
      socket.subscribeToDevice(deviceId);
      
      return () => {
        socket.unsubscribeFromDevice(deviceId);
      };
    }
  }, [isConnected, deviceId, socket]);

  /**
   * Setup data event listener
   */
  useEffect(() => {
    socket.on('imu:data', handleIMUData);
    
    return () => {
      socket.off('imu:data', handleIMUData);
    };
  }, [socket, handleIMUData]);

  /**
   * Request latest data
   */
  const requestLatest = useCallback(() => {
    if (isConnected && deviceId) {
      socket.requestLatestData(deviceId);
    }
  }, [isConnected, deviceId, socket]);

  return {
    imuData,
    shmData,
    lastUpdated,
    requestLatest,
    isConnected
  };
};

/**
 * Hook for backward compatibility - maps IMU data to sensor data format
 */
export const useSensorData = (deviceId = null) => {
  const { shmData, lastUpdated, requestLatest, isConnected } = useIMUData(deviceId);
  
  // Transform SHM data to sensor data format for existing components
  const sensorData = shmData ? {
    deviceId,
    data: {
      totalAcceleration: shmData.totalAcceleration,
      tiltAngle: shmData.tiltAngle,
      vibrationIntensity: shmData.vibrationIntensity,
      structuralDisplacement: shmData.structuralDisplacement
    }
  } : null;
  
  return {
    sensorData,
    lastUpdated,
    requestLatest,
    isConnected
  };
};

/**
 * Hook for real-time notifications
 */
export const useNotifications = () => {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Handle incoming notifications
   */
  const handleNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
      read: false,
      receivedAt: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);
  }, []);

  /**
   * Handle system alerts
   */
  const handleAlert = useCallback((alert) => {
    const alertNotification = {
      ...alert,
      id: Date.now() + Math.random(),
      type: 'alert',
      read: false,
      receivedAt: new Date()
    };
    
    setNotifications(prev => [alertNotification, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);
  }, []);

  /**
   * Setup notification event listeners
   */
  useEffect(() => {
    socket.on('notification', handleNotification);
    socket.on('system:alert', handleAlert);
    
    return () => {
      socket.off('notification', handleNotification);
      socket.off('system:alert', handleAlert);
    };
  }, [socket, handleNotification, handleAlert]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * Send notification (admin only)
   */
  const sendNotification = useCallback((message, type = 'info', targetUserId = null) => {
    if (isConnected) {
      socket.sendNotification(message, type, targetUserId);
    }
  }, [isConnected, socket]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendNotification,
    isConnected
  };
};

/**
 * Hook for connection statistics (admin)
 */
export const useConnectionStats = () => {
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState({
    connectedClients: 0,
    userActivity: []
  });

  /**
   * Handle status updates
   */
  const handleStatusUpdate = useCallback((status) => {
    setStats(status);
  }, []);

  /**
   * Handle user activity
   */
  const handleUserJoined = useCallback((data) => {
    setStats(prev => ({
      ...prev,
      userActivity: [
        { ...data, action: 'joined' },
        ...prev.userActivity.slice(0, 19) // Keep last 20 activities
      ]
    }));
  }, []);

  const handleUserLeft = useCallback((data) => {
    setStats(prev => ({
      ...prev,
      userActivity: [
        { ...data, action: 'left' },
        ...prev.userActivity.slice(0, 19)
      ]
    }));
  }, []);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    socket.on('status:update', handleStatusUpdate);
    socket.on('user:joined', handleUserJoined);
    socket.on('user:left', handleUserLeft);
    
    return () => {
      socket.off('status:update', handleStatusUpdate);
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
    };
  }, [socket, handleStatusUpdate, handleUserJoined, handleUserLeft]);

  /**
   * Request current status
   */
  const requestStatus = useCallback(() => {
    if (isConnected) {
      socket.requestStatus();
    }
  }, [isConnected, socket]);

  return {
    stats,
    requestStatus,
    isConnected
  };
};

export default useSocket;

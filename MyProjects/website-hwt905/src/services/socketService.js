/**
 * GIAI ĐOẠN 8: FRONTEND WEBSOCKET SERVICE
 * Real-time communication với backend Socket.IO server
 */

import { io } from 'socket.io-client';
import authService from './authService';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.eventListeners = new Map();
    this.subscriptions = new Set();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        console.log('🔌 Connecting to WebSocket server:', serverUrl);

        this.socket = io(serverUrl, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        });

        this.setupEventHandlers();
        
        // Connection success
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.connectionAttempts = 0;
          console.log('✅ WebSocket connected:', this.socket.id);
          resolve(this.socket);
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          this.isConnected = false;
          console.error('❌ WebSocket connection error:', error.message);
          
          if (error.message.includes('Authentication')) {
            // Auth error - don't retry
            reject(new Error('WebSocket authentication failed'));
          } else if (this.connectionAttempts < this.maxReconnectAttempts) {
            // Network error - retry
            this.connectionAttempts++;
            console.log(`🔄 Retrying connection (${this.connectionAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectDelay);
          } else {
            reject(new Error('WebSocket connection failed after max attempts'));
          }
        });

      } catch (error) {
        console.error('❌ WebSocket connection setup error:', error);
        reject(error);
      }
    });
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connected', (data) => {
      console.log('🎉 WebSocket welcome:', data.message);
      this.emit('connected', data);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected:', reason);
      this.emit('disconnected', { reason });
      
      // Auto-reconnect if not intentional
      if (reason !== 'io client disconnect' && this.connectionAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    });

    // Real-time sensor data
    this.socket.on('sensor:data', (data) => {
      console.log('📡 Real-time sensor data:', data.deviceId, data.data);
      this.emit('sensor:data', data);
    });

    // Device subscription confirmations
    this.socket.on('subscribed:device', (data) => {
      console.log('📱 Subscribed to device:', data.deviceId);
      this.subscriptions.add(data.deviceId);
      this.emit('subscribed:device', data);
    });

    this.socket.on('unsubscribed:device', (data) => {
      console.log('📱 Unsubscribed from device:', data.deviceId);
      this.subscriptions.delete(data.deviceId);
      this.emit('unsubscribed:device', data);
    });

    this.socket.on('subscribed:all', (data) => {
      console.log('🌐 Subscribed to all devices');
      this.emit('subscribed:all', data);
    });

    // Notifications
    this.socket.on('notification', (notification) => {
      console.log('📢 Notification:', notification.message);
      this.emit('notification', notification);
    });

    // System alerts
    this.socket.on('system:alert', (alert) => {
      console.log('🚨 System alert:', alert.message);
      this.emit('system:alert', alert);
    });

    // Status updates
    this.socket.on('status:update', (status) => {
      this.emit('status:update', status);
    });

    // Data responses
    this.socket.on('data:latest', (data) => {
      this.emit('data:latest', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('🔌 WebSocket error:', error.message);
      this.emit('error', error);
    });

    // Server shutdown warning
    this.socket.on('server:shutdown', (data) => {
      console.warn('🛑 Server shutdown warning:', data.message);
      this.emit('server:shutdown', data);
    });

    // User activity (admin only)
    this.socket.on('user:joined', (data) => {
      this.emit('user:joined', data);
    });

    this.socket.on('user:left', (data) => {
      this.emit('user:left', data);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.subscriptions.clear();
      this.eventListeners.clear();
      console.log('🔌 WebSocket manually disconnected');
    }
  }

  /**
   * Subscribe to device updates
   */
  subscribeToDevice(deviceId) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot subscribe - WebSocket not connected');
      return;
    }

    this.socket.emit('subscribe:device', deviceId);
    console.log('📱 Subscribing to device:', deviceId);
  }

  /**
   * Unsubscribe from device updates  
   */
  unsubscribeFromDevice(deviceId) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot unsubscribe - WebSocket not connected');
      return;
    }

    this.socket.emit('unsubscribe:device', deviceId);
    console.log('📱 Unsubscribing from device:', deviceId);
  }

  /**
   * Subscribe to all devices (admin only)
   */
  subscribeToAllDevices() {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot subscribe to all - WebSocket not connected');
      return;
    }

    this.socket.emit('subscribe:all');
    console.log('🌐 Subscribing to all devices');
  }

  /**
   * Request latest data for a device
   */
  requestLatestData(deviceId) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot request data - WebSocket not connected');
      return;
    }

    this.socket.emit('request:latest', deviceId);
    console.log('📊 Requesting latest data for:', deviceId);
  }

  /**
   * Request connection status
   */
  requestStatus() {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot request status - WebSocket not connected');
      return;
    }

    this.socket.emit('request:status');
    console.log('📊 Requesting connection status');
  }

  /**
   * Send notification (admin only)
   */
  sendNotification(message, type = 'info', targetUserId = null) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot send notification - WebSocket not connected');
      return;
    }

    this.socket.emit('send:notification', {
      message,
      type,
      targetUserId
    });
    console.log('📢 Sending notification:', message);
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Event listener error:', error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      subscriptions: Array.from(this.subscriptions),
      connectionAttempts: this.connectionAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  /**
   * Get subscribed devices
   */
  getSubscriptions() {
    return Array.from(this.subscriptions);
  }

  /**
   * Check if subscribed to device
   */
  isSubscribedToDevice(deviceId) {
    return this.subscriptions.has(deviceId);
  }

  /**
   * Auto-connect with auth check
   */
  async autoConnect() {
    try {
      const token = authService.getToken();
      if (!token) {
        console.log('ℹ️ No auth token - skipping WebSocket connection');
        return false;
      }

      await this.connect();
      return true;
    } catch (error) {
      console.error('❌ Auto-connect failed:', error.message);
      return false;
    }
  }

  /**
   * Reconnect with fresh token
   */
  async reconnectWithNewToken() {
    this.disconnect();
    return this.autoConnect();
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

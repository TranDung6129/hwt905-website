/**
 * GIAI ĐOẠN 8: BACKEND WEBSOCKET SERVICE
 * Socket.IO server implementation cho real-time communication
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map(); // Map<socketId, {userId, username, role}>
    this.deviceSubscriptions = new Map(); // Map<deviceId, Set<socketId>>
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(server) {
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        );
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        socket.userId = user._id.toString();
        socket.username = user.username;
        socket.role = user.role;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication failed'));
      }
    });

    // Connection handling
    io.on('connection', (socket) => {
      this.handleConnection(socket, io);
    });

    this.io = io;
    console.log('Socket.IO server đã khởi tạo');
    
    return io;
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket, io) {
    const clientInfo = {
      userId: socket.userId,
      username: socket.username,
      role: socket.role,
      connectedAt: new Date()
    };

    this.connectedClients.set(socket.id, clientInfo);

    console.log(`Client kết nối: ${socket.username} (${socket.role}) - Socket ID: ${socket.id}`);
    console.log(`Tổng số client kết nối: ${this.connectedClients.size}`);

    // Send welcome message
    socket.emit('connected', {
      message: 'Kết nối WebSocket đã thành công',
      socketId: socket.id,
      user: {
        id: socket.userId,
        username: socket.username,
        role: socket.role
      }
    });

    // Notify admins about new connection
    if (socket.role === 'admin') {
      this.broadcastToAdmins(io, 'user:joined', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date()
      }, socket.id);
    }

    // Device subscription handlers
    socket.on('subscribe:device', (deviceId) => {
      this.handleDeviceSubscription(socket, deviceId);
    });

    socket.on('unsubscribe:device', (deviceId) => {
      this.handleDeviceUnsubscription(socket, deviceId);
    });

    socket.on('subscribe:all', () => {
      if (socket.role === 'admin') {
        this.handleSubscribeAll(socket);
      } else {
        socket.emit('error', { message: 'Yêu cầu quyền admin' });
      }
    });

    // Request handlers
    socket.on('request:latest', (deviceId) => {
      this.handleRequestLatest(socket, deviceId);
    });

    socket.on('request:status', () => {
      this.handleRequestStatus(socket, io);
    });

    // Notification handler (admin only)
    socket.on('send:notification', (data) => {
      if (socket.role === 'admin') {
        this.handleSendNotification(io, data, socket.id);
      } else {
        socket.emit('error', { message: 'Yêu cầu quyền admin' });
      }
    });

    // Disconnection handling
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, io, reason);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.username}:`, error);
    });
  }

  /**
   * Handle device subscription
   */
  handleDeviceSubscription(socket, deviceId) {
    if (!deviceId) {
      socket.emit('error', { message: 'Device ID required' });
      return;
    }

    if (!this.deviceSubscriptions.has(deviceId)) {
      this.deviceSubscriptions.set(deviceId, new Set());
    }

    this.deviceSubscriptions.get(deviceId).add(socket.id);

    socket.emit('subscribed:device', {
      deviceId,
      message: `Subscribed to device: ${deviceId}`
    });

    console.log(`${socket.username} đã đăng ký thiết bị: ${deviceId}`);
  }

  /**
   * Handle device unsubscription
   */
  handleDeviceUnsubscription(socket, deviceId) {
    if (this.deviceSubscriptions.has(deviceId)) {
      this.deviceSubscriptions.get(deviceId).delete(socket.id);
      
      if (this.deviceSubscriptions.get(deviceId).size === 0) {
        this.deviceSubscriptions.delete(deviceId);
      }
    }

    socket.emit('unsubscribed:device', {
      deviceId,
      message: `Unsubscribed from device: ${deviceId}`
    });

    console.log(`${socket.username} đã hủy đăng ký thiết bị: ${deviceId}`);
  }

  /**
   * Handle subscribe to all devices (admin only)
   */
  handleSubscribeAll(socket) {
    socket.emit('subscribed:all', {
      message: 'Subscribed to all devices',
      totalDevices: this.deviceSubscriptions.size
    });

    console.log(`${socket.username} (admin) đã đăng ký tất cả thiết bị`);
  }

  /**
   * Handle request for latest data
   */
  async handleRequestLatest(socket, deviceId) {
    try {
      const SensorData = require('../models/SensorData');
      const latestData = await SensorData.findOne({ deviceId })
        .sort({ timestamp: -1 })
        .lean();

      if (latestData) {
        socket.emit('data:latest', {
          deviceId,
          data: latestData
        });
      } else {
        socket.emit('data:latest', {
          deviceId,
          data: null,
          message: 'Không có dữ liệu cho thiết bị này'
        });
      }
    } catch (error) {
      console.error('Lỗi lấy dữ liệu gần nhất:', error);
      socket.emit('error', { message: 'Không thể lấy dữ liệu gần nhất' });
    }
  }

  /**
   * Handle status request
   */
  handleRequestStatus(socket, io) {
    const stats = {
      connectedClients: this.connectedClients.size,
      deviceSubscriptions: this.deviceSubscriptions.size,
      userActivity: Array.from(this.connectedClients.values()).map(client => ({
        username: client.username,
        role: client.role,
        connectedAt: client.connectedAt
      }))
    };

    socket.emit('status:update', stats);
  }

  /**
   * Handle send notification (admin only)
   */
  handleSendNotification(io, data, senderSocketId) {
    const { message, type = 'info', targetUserId = null } = data;

    const notification = {
      message,
      type,
      timestamp: new Date(),
      from: this.connectedClients.get(senderSocketId)?.username || 'System'
    };

    if (targetUserId) {
      // Send to specific user
      const targetSocket = Array.from(this.connectedClients.entries())
        .find(([_, client]) => client.userId === targetUserId)?.[0];
      
      if (targetSocket) {
        io.to(targetSocket).emit('notification', notification);
      }
    } else {
      // Broadcast to all connected clients
      io.emit('notification', notification);
    }

    console.log(`Thông báo đã gửi: ${message}`);
  }

  /**
   * Handle disconnection
   */
  handleDisconnection(socket, io, reason) {
    const clientInfo = this.connectedClients.get(socket.id);
    
    if (clientInfo) {
      console.log(`Client ngắt kết nối: ${clientInfo.username} - Lý do: ${reason}`);
      
      // Remove from device subscriptions
      this.deviceSubscriptions.forEach((socketSet, deviceId) => {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          this.deviceSubscriptions.delete(deviceId);
        }
      });

      // Remove from connected clients
      this.connectedClients.delete(socket.id);

      // Notify admins
      if (clientInfo.role === 'admin') {
        this.broadcastToAdmins(io, 'user:left', {
          userId: clientInfo.userId,
          username: clientInfo.username,
          timestamp: new Date()
        }, socket.id);
      }
    }

    console.log(`Tổng số client kết nối: ${this.connectedClients.size}`);
  }

  /**
   * Broadcast IMU/SHM data to subscribed clients
   */
  broadcastSensorData(sensorData) {
    if (!this.io) {
      return;
    }

    const deviceId = sensorData.deviceId || sensorData.deviceId;
    const subscribers = this.deviceSubscriptions.get(deviceId);
    
    // Log only occasionally to reduce spam (every 100th message)
    if (!this._broadcastCount) this._broadcastCount = 0;
    this._broadcastCount++;
    if (this._broadcastCount % 100 === 0) {
      console.log(`Broadcast stats - Device: ${deviceId}, Subscribers: ${subscribers ? subscribers.size : 0}, Total clients: ${this.connectedClients.size}`);
    }

    // Prepare data object once
    const data = {
      deviceId,
      data: {
        // IMU raw data - HWT905 format
        imu: {
          // Raw acceleration
          acc_x: sensorData.acc_x ?? sensorData.ax ?? 0,
          acc_y: sensorData.acc_y ?? sensorData.ay ?? 0,
          acc_z: sensorData.acc_z ?? sensorData.az ?? 0,
          // Filtered acceleration
          acc_x_filtered: sensorData.acc_x_filtered ?? 0,
          acc_y_filtered: sensorData.acc_y_filtered ?? 0,
          acc_z_filtered: sensorData.acc_z_filtered ?? 0,
          // Gyroscope (if available)
          gx: sensorData.gx ?? 0,
          gy: sensorData.gy ?? 0,
          gz: sensorData.gz ?? 0
        },
        // SHM calculated parameters - HWT905 format
        shm: {
          // Displacement
          disp_x: sensorData.disp_x ?? 0,
          disp_y: sensorData.disp_y ?? 0,
          disp_z: sensorData.disp_z ?? 0,
          displacement_magnitude: sensorData.displacement_magnitude ?? 0,
          // Velocity
          vel_x: sensorData.vel_x ?? 0,
          vel_y: sensorData.vel_y ?? 0,
          vel_z: sensorData.vel_z ?? 0,
          velocity_magnitude: sensorData.velocity_magnitude ?? 0,
          velocity_magnitude_mm_s: sensorData.velocity_magnitude_mm_s ?? 0,
          // Frequency
          dominant_freq_x: sensorData.dominant_freq_x ?? 0,
          dominant_freq_y: sensorData.dominant_freq_y ?? 0,
          dominant_freq_z: sensorData.dominant_freq_z ?? 0,
          overall_dominant_frequency: sensorData.overall_dominant_frequency ?? sensorData.dominantFrequency ?? 0,
          // Calculated SHM parameters
          totalAcceleration: sensorData.totalAcceleration ?? sensorData.shmData?.totalAcceleration ?? 0,
          tiltAngle: sensorData.tiltAngle ?? sensorData.shmData?.tiltAngle ?? 0,
          vibrationIntensity: sensorData.vibrationIntensity ?? sensorData.shmData?.vibrationIntensity ?? 0,
          structuralDisplacement: sensorData.structuralDisplacement ?? sensorData.shmData?.structuralDisplacement ?? 0,
          dominantFrequency: sensorData.dominantFrequency ?? sensorData.overall_dominant_frequency ?? 0
        },
        timestamp: sensorData.timestamp || sensorData.receivedAt || new Date(),
        location: sensorData.location || 'Unknown'
      }
    };

    // Broadcast to specific subscribers
    if (subscribers && subscribers.size > 0) {
      subscribers.forEach(socketId => {
        this.io.to(socketId).emit('imu:data', data);
      });
    } else {
      // If no specific subscribers, broadcast to all connected clients
      this.io.emit('imu:data', data);
    }

    // Also broadcast to admins subscribed to all devices
    this.connectedClients.forEach((clientInfo, socketId) => {
      if (clientInfo.role === 'admin') {
        this.io.to(socketId).emit('imu:data', {
          deviceId,
          data: {
            imu: {
              acc_x: sensorData.acc_x ?? 0,
              acc_y: sensorData.acc_y ?? 0,
              acc_z: sensorData.acc_z ?? 0,
              acc_x_filtered: sensorData.acc_x_filtered ?? 0,
              acc_y_filtered: sensorData.acc_y_filtered ?? 0,
              acc_z_filtered: sensorData.acc_z_filtered ?? 0
            },
            shm: {
              disp_x: sensorData.disp_x ?? 0,
              disp_y: sensorData.disp_y ?? 0,
              disp_z: sensorData.disp_z ?? 0,
              vel_x: sensorData.vel_x ?? 0,
              vel_y: sensorData.vel_y ?? 0,
              vel_z: sensorData.vel_z ?? 0,
              dominant_freq_x: sensorData.dominant_freq_x ?? 0,
              dominant_freq_y: sensorData.dominant_freq_y ?? 0,
              dominant_freq_z: sensorData.dominant_freq_z ?? 0,
              overall_dominant_frequency: sensorData.overall_dominant_frequency ?? 0,
              totalAcceleration: sensorData.totalAcceleration ?? sensorData.shmData?.totalAcceleration ?? 0,
              tiltAngle: sensorData.tiltAngle ?? sensorData.shmData?.tiltAngle ?? 0,
              vibrationIntensity: sensorData.vibrationIntensity ?? sensorData.shmData?.vibrationIntensity ?? 0,
              structuralDisplacement: sensorData.structuralDisplacement ?? sensorData.shmData?.structuralDisplacement ?? 0,
              dominantFrequency: sensorData.dominantFrequency ?? sensorData.overall_dominant_frequency ?? 0
            },
            timestamp: sensorData.timestamp || sensorData.receivedAt || new Date()
          }
        });
      }
    });
  }

  /**
   * Broadcast to admin users only
   */
  broadcastToAdmins(io, event, data, excludeSocketId = null) {
    this.connectedClients.forEach((clientInfo, socketId) => {
      if (clientInfo.role === 'admin' && socketId !== excludeSocketId) {
        io.to(socketId).emit(event, data);
      }
    });
  }

  /**
   * Send system alert to all clients (cho SHM alerts)
   */
  broadcastSystemAlert(alert) {
    if (!this.io) return;

    this.io.emit('system:alert', {
      ...alert,
      timestamp: new Date()
    });
  }

  /**
   * Send SHM safety alert (cảnh báo an toàn SHM)
   */
  broadcastSHMAlert(alertData) {
    if (!this.io) return;

    const { deviceId, alertType, parameter, value, threshold } = alertData;
    
    const alert = {
      type: 'shm_alert',
      deviceId,
      alertType, // 'warning', 'critical'
      parameter, // 'totalAcceleration', 'tiltAngle', etc.
      value,
      threshold,
      message: this.getSHMAlertMessage(alertType, parameter, value, threshold),
      timestamp: new Date()
    };

    // Send to all connected clients
    this.io.emit('shm:alert', alert);
    
    console.log(`SHM Alert gửi: ${alert.message}`);
  }

  /**
   * Get SHM alert message
   */
  getSHMAlertMessage(alertType, parameter, value, threshold) {
    const parameterNames = {
      totalAcceleration: 'Gia tốc tổng hợp',
      tiltAngle: 'Góc nghiêng',
      vibrationIntensity: 'Cường độ rung',
      structuralDisplacement: 'Chuyển vị cấu trúc'
    };
    
    const paramName = parameterNames[parameter] || parameter;
    
    if (alertType === 'critical') {
      return `CẢNH BÁO NGUY HIỂM: ${paramName} đạt ${value}, vượt ngưỡng nguy hiểm ${threshold}`;
    } else if (alertType === 'warning') {
      return `Cảnh báo: ${paramName} đạt ${value}, vượt ngưỡng an toàn ${threshold}`;
    }
    
    return `${paramName}: ${value}`;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.connectedClients.size,
      deviceSubscriptions: this.deviceSubscriptions.size,
      connectedClients: Array.from(this.connectedClients.values())
    };
  }

  /**
   * Shutdown Socket.IO server
   */
  shutdown() {
    if (this.io) {
      this.io.close();
      this.connectedClients.clear();
      this.deviceSubscriptions.clear();
      console.log('Socket.IO server đã shutdown');
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
module.exports = socketService;


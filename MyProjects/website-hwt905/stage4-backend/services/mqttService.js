/**
 * GIAI ĐOẠN 4: MQTT SERVICE - "TRẠM THU THẬP" DỮ LIỆU
 * Chương 8: MQTT Integration với IoT devices
 * 
 * Service này lắng nghe (subscribe) dữ liệu từ Raspberry Pi
 * và tự động lưu vào MongoDB
 */

const mqtt = require('mqtt');
const SensorData = require('../models/SensorData');

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 5000;
    
    // Statistics
    this.stats = {
      messagesReceived: 0,
      messagesProcessed: 0,
      messagesFailed: 0,
      lastMessageTime: null,
      connectionStartTime: null
    };
  }

  /**
   * Khởi tạo MQTT connection và subscribe topics
   */
  async initialize() {
    try {
      console.log('🔄 Khởi tạo MQTT Service...');
      
      const options = {
        clientId: process.env.MQTT_CLIENT_ID || 'sensor-dashboard-server',
        username: process.env.MQTT_USERNAME || '',
        password: process.env.MQTT_PASSWORD || '',
        
        // Connection options
        keepalive: 60,
        reconnectPeriod: this.reconnectInterval,
        connectTimeout: 30000,
        
        // Will message (Last Will Testament)
        will: {
          topic: 'sensor/dashboard/status',
          payload: JSON.stringify({
            status: 'offline',
            timestamp: new Date().toISOString(),
            reason: 'unexpected_disconnect'
          }),
          qos: 1,
          retain: true
        }
      };

      // Kết nối MQTT broker
      const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
      console.log(`🔗 Đang kết nối MQTT broker: ${brokerUrl}`);
      
      this.client = mqtt.connect(brokerUrl, options);
      
      // Setup event listeners
      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        this.client.on('connect', () => {
          this.onConnect();
          resolve();
        });
        
        this.client.on('error', (error) => {
          console.error('❌ MQTT connection error:', error);
          reject(error);
        });
        
        // Timeout fallback
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('MQTT connection timeout'));
          }
        }, 30000);
      });
      
    } catch (error) {
      console.error('❌ Lỗi khởi tạo MQTT Service:', error);
      throw error;
    }
  }

  /**
   * Setup các event listeners cho MQTT client
   */
  setupEventListeners() {
    this.client.on('connect', this.onConnect.bind(this));
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('error', this.onError.bind(this));
    this.client.on('close', this.onClose.bind(this));
    this.client.on('offline', this.onOffline.bind(this));
    this.client.on('reconnect', this.onReconnect.bind(this));
  }

  /**
   * Xử lý khi kết nối MQTT thành công
   */
  onConnect() {
    console.log('✅ MQTT đã kết nối thành công');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.stats.connectionStartTime = new Date();
    
    // Subscribe các topics cần thiết
    this.subscribeToTopics();
    
    // Publish trạng thái online
    this.publishStatus('online');
  }

  /**
   * Subscribe vào các MQTT topics
   */
  subscribeToTopics() {
    const topics = [
      {
        topic: process.env.MQTT_TOPIC_SENSOR_DATA || 'sensor/data',
        qos: 1,
        description: 'Dữ liệu cảm biến từ Raspberry Pi'
      },
      {
        topic: 'sensor/+/data', // Wildcard cho multiple devices
        qos: 1,
        description: 'Dữ liệu từ nhiều sensors'  
      },
      {
        topic: 'sensor/+/status',
        qos: 1,
        description: 'Trạng thái devices'
      },
      {
        topic: 'sensor/+/error',
        qos: 1,
        description: 'Lỗi từ devices'
      }
    ];

    topics.forEach(({ topic, qos, description }) => {
      this.client.subscribe(topic, { qos }, (error) => {
        if (error) {
          console.error(`❌ Lỗi subscribe ${topic}:`, error);
        } else {
          console.log(`📡 Đã subscribe: ${topic} (${description})`);
        }
      });
    });
  }

  /**
   * Xử lý tin nhắn MQTT nhận được - CORE FUNCTION
   */
  async onMessage(topic, message) {
    this.stats.messagesReceived++;
    this.stats.lastMessageTime = new Date();
    
    try {
      console.log(`📨 Nhận MQTT message từ topic: ${topic}`);
      console.log(`📊 Raw message: ${message.toString()}`);
      
      // Parse JSON message
      let data;
      try {
        data = JSON.parse(message.toString());
      } catch (parseError) {
        console.error('❌ Lỗi parse JSON:', parseError);
        this.stats.messagesFailed++;
        return;
      }

      // Route message dựa trên topic
      if (topic.includes('/data')) {
        await this.processSensorData(topic, data);
      } else if (topic.includes('/status')) {
        await this.processDeviceStatus(topic, data);
      } else if (topic.includes('/error')) {
        await this.processDeviceError(topic, data);
      } else {
        console.log(`⚠️ Unknown topic: ${topic}`);
      }
      
      this.stats.messagesProcessed++;
      
    } catch (error) {
      console.error('❌ Lỗi xử lý MQTT message:', error);
      this.stats.messagesFailed++;
    }
  }

  /**
   * Xử lý dữ liệu cảm biến - LƯU VÀO MONGODB
   */
  async processSensorData(topic, data) {
    try {
      console.log('💾 Đang xử lý sensor data...');
      
      // Extract device ID từ topic (sensor/device123/data)
      const deviceId = this.extractDeviceId(topic) || data.deviceId || 'unknown';
      
      // Validate dữ liệu bắt buộc
      if (!this.isValidSensorData(data)) {
        console.error('❌ Dữ liệu sensor không hợp lệ:', data);
        return;
      }

      // Tạo sensor data object
      const sensorDataDoc = new SensorData({
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure || null,
        light: data.light || null,
        deviceId: deviceId,
        location: data.location || 'Unknown',
        batteryLevel: data.batteryLevel || null,
        signalStrength: data.signalStrength || null,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        isValid: true
      });

      // Lưu vào MongoDB
      await sensorDataDoc.save();
      
      console.log(`✅ Đã lưu sensor data: ${deviceId} - Temp: ${data.temperature}°C, Humidity: ${data.humidity}%`);
      
      // STAGE 8: Broadcast real-time data via WebSocket
      try {
        const socketService = require('./socketService');
        socketService.broadcastSensorData(sensorDataDoc);
      } catch (socketError) {
        console.warn('Socket broadcast warning:', socketError.message);
      }
      
    } catch (error) {
      console.error('❌ Lỗi lưu sensor data:', error);
      
      // Lưu error record
      const errorRecord = new SensorData({
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        deviceId: this.extractDeviceId(topic) || 'error',
        isValid: false,
        errorMessage: error.message
      });
      
      try {
        await errorRecord.save();
      } catch (saveError) {
        console.error('❌ Không thể lưu error record:', saveError);
      }
    }
  }

  /**
   * Xử lý trạng thái device
   */
  async processDeviceStatus(topic, data) {
    const deviceId = this.extractDeviceId(topic);
    console.log(`📱 Device status từ ${deviceId}:`, data);
    
    // TODO: Lưu device status vào database (future enhancement)
    // Có thể tạo DeviceStatus model sau này
  }

  /**
   * Xử lý lỗi từ device  
   */
  async processDeviceError(topic, data) {
    const deviceId = this.extractDeviceId(topic);
    console.error(`🚨 Device error từ ${deviceId}:`, data);
    
    // TODO: Log errors, send alerts (future enhancement)
  }

  /**
   * Validate dữ liệu sensor
   */
  isValidSensorData(data) {
    // Kiểm tra các field bắt buộc
    if (typeof data.temperature !== 'number' || typeof data.humidity !== 'number') {
      return false;
    }
    
    // Kiểm tra range hợp lý
    if (data.temperature < -50 || data.temperature > 100) {
      return false;
    }
    
    if (data.humidity < 0 || data.humidity > 100) {
      return false;
    }
    
    return true;
  }

  /**
   * Extract device ID từ MQTT topic
   */
  extractDeviceId(topic) {
    // Topic format: sensor/device123/data -> device123
    const parts = topic.split('/');
    if (parts.length >= 2) {
      return parts[1];
    }
    return null;
  }

  /**
   * Emit event cho real-time updates (Giai đoạn 8)
   */
  emitSensorDataEvent(sensorData) {
    // Placeholder cho Socket.IO integration
    // Giai đoạn 8 sẽ implement WebSocket real-time
    console.log(`🔄 [Future] Emit real-time event cho device: ${sensorData.deviceId}`);
  }

  /**
   * Publish trạng thái server
   */
  publishStatus(status) {
    const statusMessage = {
      status: status,
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      version: '1.0.0'
    };
    
    this.client.publish('sensor/dashboard/status', JSON.stringify(statusMessage), {
      qos: 1,
      retain: true
    });
    
    console.log(`📡 Published status: ${status}`);
  }

  /**
   * Event handlers
   */
  onError(error) {
    console.error('❌ MQTT error:', error);
    this.isConnected = false;
  }

  onClose() {
    console.log('🔌 MQTT connection closed');
    this.isConnected = false;
  }

  onOffline() {
    console.log('📴 MQTT client offline');
    this.isConnected = false;
  }

  onReconnect() {
    this.reconnectAttempts++;
    console.log(`🔄 MQTT đang reconnect (lần ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Đã vượt quá số lần reconnect tối đa');
      this.client.end();
    }
  }

  /**
   * Lấy thống kê
   */
  getStats() {
    return {
      ...this.stats,
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      uptime: this.stats.connectionStartTime ? 
        Date.now() - this.stats.connectionStartTime : 0
    };
  }

  /**
   * Publish test message (để test MQTT)
   */
  publishTestMessage() {
    if (!this.isConnected) {
      console.error('❌ MQTT chưa kết nối');
      return;
    }
    
    const testData = {
      temperature: 25.5 + (Math.random() - 0.5) * 10,
      humidity: 60 + (Math.random() - 0.5) * 20,
      pressure: 1013 + (Math.random() - 0.5) * 20,
      light: 500 + Math.random() * 500,
      deviceId: 'test-device',
      timestamp: new Date().toISOString(),
      batteryLevel: 85,
      signalStrength: -45
    };
    
    this.client.publish('sensor/data', JSON.stringify(testData));
    console.log('📤 Published test message:', testData);
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Đang shutdown MQTT service...');
    
    if (this.client && this.isConnected) {
      // Publish offline status
      this.publishStatus('offline');
      
      // Close connection
      await new Promise((resolve) => {
        this.client.end(false, resolve);
      });
    }
    
    console.log('✅ MQTT service đã shutdown');
  }
}

// Export singleton instance
const mqttService = new MQTTService();
module.exports = mqttService;

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
      console.log('Đang khởi tạo dịch vụ MQTT...');
      
      // Lấy thông tin authentication
      const username = process.env.MQTT_USERNAME || '';
      const password = process.env.MQTT_PASSWORD || '';
      const clientId = process.env.MQTT_CLIENT_ID || 'sensor-dashboard-server';
      
      // Log authentication status (không log password)
      if (username) {
        console.log(`MQTT Authentication: Username = ${username}, Password = ${password ? '***' : '(not set)'}`);
      } else {
        console.log('MQTT Authentication: Không sử dụng username/password (anonymous connection)');
      }
      
      const options = {
        clientId: clientId,
        username: username,
        password: password,
        
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
      console.log(`Đang kết nối MQTT broker: ${brokerUrl}`);
      
      this.client = mqtt.connect(brokerUrl, options);
      
      // Setup event listeners
      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        this.client.on('connect', () => {
          this.onConnect();
          resolve();
        });
        
        this.client.on('error', (error) => {
          console.error('Lỗi kết nối MQTT:', error);
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
      console.error('Lỗi khởi tạo dịch vụ MQTT:', error);
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
    console.log('MQTT đã kết nối thành công');
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
        topic: 'sensor/+/processed_data', // HWT905 processed data
        qos: 1,
        description: 'Dữ liệu HWT905 đã xử lý từ Raspberry Pi'
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
          console.error(`Lỗi subscribe ${topic}:`, error);
        } else {
          console.log(`Đã subscribe: ${topic} (${description})`);
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
      // Parse JSON message
      let data;
      try {
        data = JSON.parse(message.toString());
      } catch (parseError) {
        console.error('Lỗi parse JSON:', parseError);
        this.stats.messagesFailed++;
        return;
      }

      // Route message dựa trên topic
      if (topic.includes('/data') || topic.includes('/processed_data')) {
        await this.processSensorData(topic, data);
      } else if (topic.includes('/status')) {
        await this.processDeviceStatus(topic, data);
      } else if (topic.includes('/error')) {
        await this.processDeviceError(topic, data);
      }
      
      this.stats.messagesProcessed++;
      
    } catch (error) {
      console.error('Lỗi xử lý tin nhắn MQTT:', error);
      this.stats.messagesFailed++;
    }
  }

  /**
   * Xử lý dữ liệu cảm biến - LƯU VÀO MONGODB
   */
  async processSensorData(topic, data) {
    try {
      // Log only occasionally to reduce spam
      if (!this._processCount) this._processCount = 0;
      this._processCount++;
      if (this._processCount % 100 === 0) {
        console.log(`Đang xử lý dữ liệu HWT905... (${this._processCount} packets processed)`);
      }
      
      // Extract device ID từ topic hoặc metadata
      const deviceId = this.extractDeviceId(topic) || data.metadata?.source || 'hwt905-unknown';
      
      // Kiểm tra format dữ liệu mới
      if (!this.isValidHWT905Data(data)) {
        console.error('Dữ liệu HWT905 không hợp lệ:', data);
        return;
      }

      // Lấy data point đầu tiên (hoặc duy nhất)
      const dataPoint = data.data_points[0];
      
      // Tính toán các thông số SHM từ dữ liệu thực tế
      const shmData = this.calculateSHMFromHWT905(dataPoint);

      // Tạo sensor data object với dữ liệu SHM
      const sensorDataDoc = new SensorData({
        // Dữ liệu gia tốc thô và đã lọc
        ax: dataPoint.acc_x || 0,
        ay: dataPoint.acc_y || 0, 
        az: dataPoint.acc_z || 0,
        acc_x_filtered: dataPoint.acc_x_filtered,
        acc_y_filtered: dataPoint.acc_y_filtered,
        acc_z_filtered: dataPoint.acc_z_filtered,
        
        // Dữ liệu vận tốc
        vel_x: dataPoint.vel_x,
        vel_y: dataPoint.vel_y,
        vel_z: dataPoint.vel_z,
        velocity_magnitude: dataPoint.velocity_magnitude,
        velocity_magnitude_mm_s: dataPoint.velocity_magnitude_mm_s,
        
        // Dữ liệu chuyển vị
        disp_x: dataPoint.disp_x,
        disp_y: dataPoint.disp_y,
        disp_z: dataPoint.disp_z,
        displacement_magnitude: dataPoint.displacement_magnitude,
        
        // Dữ liệu tần số
        dominant_freq_x: dataPoint.dominant_freq_x,
        dominant_freq_y: dataPoint.dominant_freq_y,
        dominant_freq_z: dataPoint.dominant_freq_z,
        overall_dominant_frequency: dataPoint.overall_dominant_frequency,
        
        // Các thông số SHM đã tính toán
        totalAcceleration: shmData.totalAcceleration,
        tiltAngle: shmData.tiltAngle,  
        vibrationIntensity: shmData.vibrationIntensity,
        structuralDisplacement: shmData.structuralDisplacement,
        dominantFrequency: shmData.dominantFrequency,
        
        // Metadata
        deviceId: deviceId,
        location: data.metadata?.location || 'Unknown',
        sample_count: data.metadata?.sample_count,
        strategy: data.metadata?.strategy,
        rls_warmed_up: dataPoint.rls_warmed_up,
        timestamp: dataPoint.ts ? new Date(dataPoint.ts * 1000) : new Date(),
        isValid: true
      });

      // Lưu vào MongoDB
      await sensorDataDoc.save();
      
      // STAGE 8: Broadcast real-time data via WebSocket
      try {
        const socketService = require('./socketService');
        
        const broadcastData = {
          deviceId: deviceId,
          ...sensorDataDoc.toObject(),
          shmData: shmData
        };
        
        socketService.broadcastSensorData(broadcastData);
      } catch (socketError) {
        console.error('Socket broadcast ERROR:', socketError.message);
      }
      
    } catch (error) {
      console.error('Lỗi lưu dữ liệu cảm biến:', error);
      
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
        console.error('Không thể lưu record lỗi:', saveError);
      }
    }
  }

  /**
   * Xử lý trạng thái device
   */
  async processDeviceStatus(topic, data) {
    const deviceId = this.extractDeviceId(topic);
    console.log(`Trạng thái thiết bị từ ${deviceId}:`, data);
    
    // TODO: Lưu device status vào database (future enhancement)
    // Có thể tạo DeviceStatus model sau này
  }

  /**
   * Xử lý lỗi từ device  
   */
  async processDeviceError(topic, data) {
    const deviceId = this.extractDeviceId(topic);
    console.error(`Lỗi thiết bị từ ${deviceId}:`, data);
    
    // TODO: Log errors, send alerts (future enhancement)
  }

  /**
   * Validate dữ liệu HWT905 format mới
   */
  isValidHWT905Data(data) {
    // Kiểm tra cấu trúc cơ bản
    if (!data.metadata || !data.data_points || !Array.isArray(data.data_points)) {
      console.error('Thiếu metadata hoặc data_points trong HWT905 data');
      return false;
    }
    
    if (data.data_points.length === 0) {
      console.error('data_points rỗng');
      return false;
    }
    
    const dataPoint = data.data_points[0];
    const requiredFields = [
      'ts', 'disp_x', 'disp_y', 'disp_z', 'displacement_magnitude',
      'overall_dominant_frequency', 'acc_x', 'acc_y', 'acc_z'
    ];
    
    for (const field of requiredFields) {
      if (typeof dataPoint[field] !== 'number') {
        console.error(`Thiếu hoặc không hợp lệ field HWT905: ${field}`);
        return false;
      }
    }
    
    // Kiểm tra range hợp lý
    if (Math.abs(dataPoint.displacement_magnitude) > 1) { // > 1m displacement
      console.warn('Chuyển vị quá lớn:', dataPoint.displacement_magnitude);
    }
    
    if (dataPoint.overall_dominant_frequency > 1000) { // > 1kHz
      console.warn('Tần số quá cao:', dataPoint.overall_dominant_frequency);
    }
    
    return true;
  }

  /**
   * Tính toán các thông số SHM từ dữ liệu HWT905 thực tế
   */
  calculateSHMFromHWT905(dataPoint) {
    // 1. Gia tốc tổng hợp từ dữ liệu đã lọc
    const totalAcceleration = Math.sqrt(
      (dataPoint.acc_x_filtered || 0) ** 2 + 
      (dataPoint.acc_y_filtered || 0) ** 2 + 
      (dataPoint.acc_z_filtered || 0) ** 2
    );
    
    // 2. Góc nghiêng từ displacement components
    const tiltAngle = Math.atan2(
      Math.sqrt(dataPoint.disp_x ** 2 + dataPoint.disp_y ** 2),
      Math.abs(dataPoint.disp_z)
    ) * (180 / Math.PI); // Chuyển sang độ
    
    // 3. Cường độ rung từ velocity magnitude
    const vibrationIntensity = dataPoint.velocity_magnitude_mm_s || 0;
    
    // 4. Chuyển vị cấu trúc - sử dụng displacement magnitude thực tế
    const structuralDisplacement = (dataPoint.displacement_magnitude || 0) * 1000; // Chuyển sang mm
    
    // 5. Tần số đặc trưng
    const dominantFrequency = dataPoint.overall_dominant_frequency || 0;
    
    return {
      totalAcceleration: Math.min(Math.max(totalAcceleration, 0), 20), // 0-20 m/s²
      tiltAngle: Math.min(Math.max(tiltAngle, 0), 45), // 0-45°
      vibrationIntensity: Math.min(Math.max(vibrationIntensity, 0), 100), // 0-100 mm/s
      structuralDisplacement: Math.min(Math.max(structuralDisplacement, 0), 50), // 0-50 mm
      dominantFrequency: Math.min(Math.max(dominantFrequency, 0), 50) // 0-50 Hz
    };
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
    console.log(`[Future] Emit sự kiện real-time cho thiết bị: ${sensorData.deviceId}`);
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
    
    console.log(`Đã xuất trạng thái: ${status}`);
  }

  /**
   * Event handlers
   */
  onError(error) {
    console.error('Lỗi MQTT:', error);
    
    // Kiểm tra lỗi authentication
    if (error.message && (
      error.message.includes('Not authorized') || 
      error.message.includes('Authentication failed') ||
      error.message.includes('Bad username or password')
    )) {
      console.error('❌ Lỗi xác thực MQTT: Username hoặc Password không đúng!');
      console.error('💡 Vui lòng kiểm tra MQTT_USERNAME và MQTT_PASSWORD trong file .env');
    }
    
    this.isConnected = false;
  }

  onClose() {
    console.log('Kết nối MQTT đã đóng');
    this.isConnected = false;
  }

  onOffline() {
    console.log('MQTT client đã offline');
    this.isConnected = false;
  }

  onReconnect() {
    this.reconnectAttempts++;
    console.log(`MQTT đang reconnect (lần ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Đã vượt quá số lần reconnect tối đa');
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
      console.error('MQTT chưa kết nối');
      return;
    }
    
    // HWT905 format mới theo package MQTT thực tế
    const testData = {
      metadata: {
        source: 'HWT905_RasPi_Test',
        strategy: 'continuous',
        sample_count: 1,
        start_time: Date.now() / 1000,
        end_time: Date.now() / 1000,
        location: 'Cầu test SHM'
      },
      data_points: [{
        ts: Date.now() / 1000,
        vel_x: (Math.random() - 0.5) * 0.0001,
        vel_y: (Math.random() - 0.5) * 0.0001,
        vel_z: (Math.random() - 0.5) * 0.0001,
        velocity_magnitude: Math.random() * 0.0003,
        velocity_magnitude_mm_s: Math.random() * 30, // 0-30 mm/s
        disp_x: (Math.random() - 0.5) * 0.0001,
        disp_y: (Math.random() - 0.5) * 0.0001,
        disp_z: (Math.random() - 0.5) * 0.0001,
        displacement_magnitude: Math.random() * 0.0001, // 0-0.1mm
        dominant_freq_x: Math.random() * 5,
        dominant_freq_y: Math.random() * 5,
        dominant_freq_z: Math.random() * 5,
        overall_dominant_frequency: Math.random() * 10, // 0-10 Hz
        acc_x_filtered: (Math.random() - 0.5) * 0.001,
        acc_y_filtered: (Math.random() - 0.5) * 0.001,
        acc_z_filtered: (Math.random() - 0.5) * 0.001,
        acc_x: (Math.random() - 0.5) * 2,
        acc_y: (Math.random() - 0.5) * 2,
        acc_z: 1.0 + (Math.random() - 0.5) * 0.1,
        rls_warmed_up: true
      }]
    };
    
    this.client.publish('sensor/data', JSON.stringify(testData));
    console.log('Đã xuất tin nhắn test:', testData);
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('Đang shutdown dịch vụ MQTT...');
    
    if (this.client && this.isConnected) {
      // Publish offline status
      this.publishStatus('offline');
      
      // Close connection
      await new Promise((resolve) => {
        this.client.end(false, resolve);
      });
    }
    
    console.log('Dịch vụ MQTT đã shutdown');
  }
}

// Export singleton instance
const mqttService = new MQTTService();
module.exports = mqttService;

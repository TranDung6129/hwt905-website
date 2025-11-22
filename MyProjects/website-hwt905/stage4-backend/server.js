/**
 * GIAI ĐOẠN 4: MAIN SERVER
 * Chương 8: Express Server với MongoDB và MQTT integration
 * 
 * Server này là "Trạm Thu Thập" dữ liệu:
 * 1. Lắng nghe MQTT từ Raspberry Pi
 * 2. Lưu dữ liệu vào MongoDB
 * 3. Cung cấp REST API cho React frontend
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import configurations và services
const { connectDatabase } = require('./config/database');
const mqttService = require('./services/mqttService');
const socketService = require('./services/socketService');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestLogger, getMorganLogger } = require('./middleware/logger');

// Import routes
const sensorRoutes = require('./routes/sensorRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();

/**
 * MIDDLEWARE SETUP
 */

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false // Cho phép embedding cho development
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(getMorganLogger());
app.use(requestLogger);

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

/**
 * ROUTES SETUP
 */

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sensor Dashboard API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint for load balancers
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected', // TODO: Check actual DB connection
      mqtt: mqttService.isConnected ? 'connected' : 'disconnected'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);

// Serve static files (future: React build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../stage3-react/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../stage3-react/build/index.html'));
  });
}

/**
 * ERROR HANDLING
 */
app.use(notFound);
app.use(errorHandler);

/**
 * SERVER STARTUP SEQUENCE
 */
const startServer = async () => {
  try {
    console.log('🚀 Đang khởi động Sensor Dashboard Server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Node Version: ${process.version}`);
    
    // 1. Kết nối MongoDB
    console.log('\n1️⃣ Kết nối Database...');
    await connectDatabase();
    
    // 2. Khởi tạo MQTT Service
    console.log('\n2️⃣ Khởi tạo MQTT Service...');
    try {
      await mqttService.initialize();
      console.log('✅ MQTT Service đã sẵn sàng');
    } catch (mqttError) {
      console.warn('⚠️ MQTT Service không thể kết nối:', mqttError.message);
      console.warn('📝 Server sẽ tiếp tục chạy chỉ với REST API');
    }
    
    // 3. Tạo default admin user (chuẩn bị cho giai đoạn 6)
    console.log('\n3️⃣ Chuẩn bị Users...');
    try {
      const User = require('./models/User');
      await User.createDefaultAdmin();
    } catch (userError) {
      console.log('📝 Default admin đã tồn tại hoặc lỗi tạo user');
    }
    
    // 4. Start HTTP server
    console.log('\n4️⃣ Khởi động HTTP Server...');
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, () => {
      console.log(`\n🎉 SERVER ĐÃ KHỞI ĐỘNG THÀNH CÔNG!`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📊 API Endpoints:`);
      console.log(`   - GET  /api/sensors/latest`);
      console.log(`   - GET  /api/sensors/history`);
      console.log(`   - GET  /api/sensors/stats`);
      console.log(`   - POST /api/sensors/data`);
      console.log(`   - GET  /api/sensors/mqtt-status`);
      console.log(`🔧 MQTT Topic: ${process.env.MQTT_TOPIC_SENSOR_DATA || 'sensor/data'}`);
      console.log(`📱 Frontend: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`\n✅ Sẵn sàng nhận dữ liệu từ Raspberry Pi!\n`);
    });

    // 5. Initialize Socket.IO for real-time communication (Stage 8)
    console.log('\n5️⃣ Khởi tạo WebSocket Service...');
    try {
      const io = socketService.initialize(server);
      console.log('🔌 WebSocket Service đã sẵn sàng cho real-time communication');
    } catch (socketError) {
      console.warn('⚠️ WebSocket Service initialization failed:', socketError.message);
    }
    
    // Graceful shutdown handling
    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));
    
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (server, signal) => {
  console.log(`\n🛑 Nhận signal ${signal}, đang shutdown gracefully...`);
  
  // Close HTTP server
  server.close(async () => {
    console.log('📴 HTTP server đã đóng');
    
    try {
      // Shutdown MQTT service
      await mqttService.shutdown();
      
      // Close database connection
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('💾 Database connection đã đóng');
      
      console.log('✅ Graceful shutdown hoàn tất');
      process.exit(0);
    } catch (error) {
      console.error('❌ Lỗi during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

/**
 * Unhandled rejection handler
 */
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Promise Rejection:', err);
  console.log('🛑 Shutting down server due to unhandled promise rejection');
  process.exit(1);
});

/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  console.log('🛑 Shutting down server due to uncaught exception');
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;

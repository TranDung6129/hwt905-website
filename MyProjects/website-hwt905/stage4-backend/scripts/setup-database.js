/**
 * SCRIPT SETUP DATABASE - Tạo sample data và indexes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SensorData = require('../models/SensorData');
const User = require('../models/User');

async function setupDatabase() {
  try {
    console.log('📊 Đang setup database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');
    
    // Clear existing data (optional)
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await SensorData.deleteMany({});
      console.log('🗑️ Đã xóa dữ liệu cũ');
    }
    
    // Create sample sensor data
    console.log('📊 Tạo sample sensor data...');
    const sampleData = [];
    const now = Date.now();
    
    // Generate 100 records over last 24 hours
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now - (i * 15 * 60 * 1000)); // Every 15 minutes
      
      sampleData.push({
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        pressure: 1000 + Math.random() * 20,
        light: 100 + Math.random() * 800,
        deviceId: i % 3 === 0 ? 'raspberry-pi-001' : 
                  i % 3 === 1 ? 'raspberry-pi-002' : 'test-device',
        location: 'Sample Lab',
        timestamp: timestamp,
        batteryLevel: 70 + Math.random() * 30,
        signalStrength: -30 - Math.random() * 50
      });
    }
    
    await SensorData.insertMany(sampleData);
    console.log(`✅ Đã tạo ${sampleData.length} sample records`);
    
    // Create default admin user
    console.log('👤 Tạo default admin user...');
    try {
      await User.createDefaultAdmin();
      console.log('✅ Default admin user: admin/admin123');
    } catch (error) {
      console.log('📝 Admin user đã tồn tại');
    }
    
    // Create indexes
    console.log('🔍 Tạo database indexes...');
    await SensorData.createIndexes();
    await User.createIndexes();
    console.log('✅ Indexes đã tạo');
    
    // Display statistics
    console.log('\n📊 Database Statistics:');
    
    const sensorCount = await SensorData.countDocuments();
    console.log(`📊 Sensor records: ${sensorCount}`);
    
    const devices = await SensorData.distinct('deviceId');
    console.log(`📱 Devices: ${devices.join(', ')}`);
    
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    if (latestData) {
      console.log(`🕐 Latest reading: ${latestData.timestamp}`);
      console.log(`🌡️ Temperature: ${latestData.temperature}°C`);
    }
    
    const userCount = await User.countDocuments();
    console.log(`👤 Users: ${userCount}`);
    
    console.log('\n✅ Database setup hoàn tất!');
    console.log('🚀 Bạn có thể chạy server: npm start');
    
  } catch (error) {
    console.error('❌ Lỗi setup database:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run setup
setupDatabase();

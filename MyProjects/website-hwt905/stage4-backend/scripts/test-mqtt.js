/**
 * SCRIPT TEST MQTT - Mô phỏng Raspberry Pi
 * Chạy script này để test MQTT service mà không cần Raspberry Pi thật
 */

require('dotenv').config();
const mqtt = require('mqtt');

// MQTT Configuration
const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const TOPIC = process.env.MQTT_TOPIC_SENSOR_DATA || 'sensor/data';

console.log('📡 Mô phỏng Raspberry Pi - MQTT Publisher');
console.log(`🔗 Kết nối: ${BROKER_URL}`);
console.log(`📊 Topic: ${TOPIC}`);

// Kết nối MQTT
const client = mqtt.connect(BROKER_URL, {
  clientId: 'test-raspberry-pi',
  keepalive: 60
});

client.on('connect', () => {
  console.log('✅ Đã kết nối MQTT broker');
  console.log('🚀 Bắt đầu gửi sensor data mỗi 5 giây...\n');
  
  // Gửi data mỗi 5 giây
  setInterval(publishSensorData, 5000);
});

client.on('error', (error) => {
  console.error('❌ MQTT error:', error);
});

function publishSensorData() {
  // Generate realistic sensor data
  const sensorData = {
    temperature: generateTemperature(),
    humidity: generateHumidity(), 
    pressure: generatePressure(),
    light: generateLight(),
    deviceId: 'test-raspberry-pi',
    location: 'Test Lab',
    batteryLevel: generateBattery(),
    signalStrength: generateSignal(),
    timestamp: new Date().toISOString()
  };
  
  // Publish to MQTT
  client.publish(TOPIC, JSON.stringify(sensorData), { qos: 1 }, (error) => {
    if (error) {
      console.error('❌ Publish error:', error);
    } else {
      console.log('📤 Sent sensor data:');
      console.log(`   🌡️  Temperature: ${sensorData.temperature}°C`);
      console.log(`   💧 Humidity: ${sensorData.humidity}%`);
      console.log(`   🌬️  Pressure: ${sensorData.pressure} hPa`);
      console.log(`   ☀️  Light: ${sensorData.light} lux`);
      console.log(`   🔋 Battery: ${sensorData.batteryLevel}%`);
      console.log(`   📶 Signal: ${sensorData.signalStrength} dBm\n`);
    }
  });
}

// Realistic sensor data generators
function generateTemperature() {
  // 20-30°C với biến động tự nhiên
  const base = 25;
  const variation = (Math.random() - 0.5) * 10;
  return Math.round((base + variation) * 10) / 10;
}

function generateHumidity() {
  // 40-80% với bias về 60%
  const base = 60;
  const variation = (Math.random() - 0.5) * 40;
  const humidity = Math.max(30, Math.min(90, base + variation));
  return Math.round(humidity * 10) / 10;
}

function generatePressure() {
  // 1000-1020 hPa
  const base = 1013;
  const variation = (Math.random() - 0.5) * 20;
  return Math.round((base + variation) * 10) / 10;
}

function generateLight() {
  // 100-1000 lux với xu hướng thay đổi theo thời gian
  const hour = new Date().getHours();
  let base = 200;
  
  if (hour >= 6 && hour <= 18) {
    // Daytime: bright
    base = 600;
  } else if (hour >= 19 && hour <= 22) {
    // Evening: dim
    base = 200;
  } else {
    // Night: dark
    base = 50;
  }
  
  const variation = Math.random() * 300;
  return Math.round(base + variation);
}

function generateBattery() {
  // Slow discharge: 70-100%
  return Math.round(Math.random() * 30 + 70);
}

function generateSignal() {
  // WiFi signal: -30 to -80 dBm
  return Math.round(Math.random() * -50 - 30);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping MQTT test...');
  client.end();
  process.exit(0);
});

console.log('📝 Nhấn Ctrl+C để dừng test');

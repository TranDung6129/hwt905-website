require('dotenv').config();
const mqtt = require('mqtt');

console.log('🔍 STARTING MQTT DIAGNOSTIC TOOL 🔍');
console.log('-----------------------------------');

const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;

console.log(`Broker: ${brokerUrl}`);
console.log(`Auth: ${username ? 'Yes (Username provided)' : 'No'}`);

const client = mqtt.connect(brokerUrl, {
  clientId: 'diagnostic-tool-' + Math.random().toString(16).substr(2, 8),
  username,
  password,
  connectTimeout: 10000
});

client.on('connect', () => {
  console.log('✅ Connected to MQTT Broker!');
  console.log('📡 Subscribing to ALL topics (#)...');
  
  client.subscribe('#', (err) => {
    if (err) {
      console.error('❌ Subscription failed:', err);
    } else {
      console.log('✅ Subscribed to "#" (Waiting for messages...)');
    }
  });
});

client.on('message', (topic, message) => {
  console.log('\n📨 MESSAGE RECEIVED');
  console.log(`📌 Topic: ${topic}`);
  try {
    const strMsg = message.toString();
    const jsonMsg = JSON.parse(strMsg);
    console.log('📦 Payload (JSON):');
    console.dir(jsonMsg, { depth: null, colors: true });
    
    // Check if it matches HWT905 format
    if (jsonMsg.data_points) {
      console.log('✅ Detect: Potential HWT905 Data Format');
    } else {
      console.log('⚠️ Warning: Does not match expected HWT905 format (missing data_points)');
    }
  } catch (e) {
    console.log(`📦 Payload (String): ${message.toString()}`);
  }
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
});

client.on('offline', () => {
  console.log('⚠️ MQTT Client Offline');
});

// Stop after 60 seconds
setTimeout(() => {
  console.log('\n🛑 Diagnostic finished (60s timeout)');
  client.end();
  process.exit(0);
}, 60000);


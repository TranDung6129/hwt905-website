# 🌐 GIAI ĐOẠN 8: REAL-TIME WEBSOCKET INTEGRATION

## 🎯 Mục tiêu Stage 8

Tích hợp **WebSocket real-time communication** để:
- **Live streaming** dữ liệu sensor từ MQTT tới frontend
- **Real-time notifications** và alerts  
- **Multi-user connection management**
- **Live connection status** và user activity tracking

---

## 🏗️ Kiến trúc Real-time System

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Raspberry Pi   │───▶│   MQTT Broker    │───▶│  Node.js Server │
│  (IoT Sensor)   │    │  (mosquitto)     │    │  + Socket.IO    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Client   │◀───│   WebSocket      │◀───│   MongoDB       │
│  (Dashboard)    │    │   Connection     │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🚀 QUICK START

### 1. Backend Setup
```bash
cd /path/to/stage4-backend

# Install dependencies
npm install

# Ensure Socket.IO is installed
npm install socket.io@^4.7.2

# Start server with WebSocket
npm run dev
```

### 2. Frontend Setup  
```bash
cd /path/to/stage8-realtime

# Install dependencies  
npm install

# Start React app
npm start
```

### 3. Test Real-time Features

1. **🔌 WebSocket Connection**: Mở dashboard, check connection indicator
2. **📡 Live Data**: Gửi MQTT data, xem real-time updates
3. **🔔 Notifications**: Test notification system
4. **👥 Multi-user**: Mở nhiều tabs/browsers để test

---

## 📋 Components Overview

### Backend Components

| File | Mô tả | Tính năng |
|------|-------|-----------|
| `services/socketService.js` | Socket.IO server management | Authentication, subscriptions, broadcasting |
| `server.js` | WebSocket initialization | Integrate với HTTP server |
| `services/mqttService.js` | MQTT + WebSocket bridge | Broadcast sensor data real-time |

### Frontend Components

| File | Mô tả | Tính năng |
|------|-------|-----------|
| `services/socketService.js` | WebSocket client service | Connection, subscriptions, events |
| `hooks/useSocket.js` | React WebSocket hooks | Connection state, sensor data, notifications |
| `components/common/RealTimeIndicator.js` | Connection status UI | Live indicator với animations |
| `components/dashboard/NotificationCenter.js` | Real-time notifications | Bell icon, dropdown, filters |
| `pages/DashboardPage.js` | Updated dashboard | Real-time mode toggle, live data |

---

## 🔧 Configuration

### Environment Variables

```env
# Backend (.env)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sensor_dashboard
JWT_SECRET=your-jwt-secret-key
CLIENT_URL=http://localhost:3000

# MQTT Settings
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_TOPIC_SENSOR_DATA=sensor/data

# Socket.IO Settings (optional)
SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
```

```env
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

---

## 📱 Real-time Features

### 1. 🔴 Live Sensor Data
- **Auto-subscribe** to device data khi chọn device
- **Real-time updates** without page refresh
- **Visual indicators** cho live data
- **Fallback** to API polling nếu WebSocket fails

### 2. 🔔 Notification System
- **Bell icon** với unread count animation
- **Real-time notifications** từ server
- **System alerts** cho errors/warnings  
- **User activity** notifications (admin only)
- **Filter** by type: All, Unread, Alerts

### 3. 👥 Connection Management
- **Multi-user support** với unique sessions
- **Connection status** indicators
- **Auto-reconnection** với exponential backoff
- **Graceful disconnection** handling
- **User join/leave** notifications

### 4. 🎛️ Admin Features
- **Subscribe to all devices** simultaneously
- **View connection statistics**  
- **User activity monitoring**
- **Send system notifications**
- **Connection management**

---

## 🧪 Testing Guide

### WebSocket Connection Testing

```javascript
// Test connection trong browser console
socket.emit('request:status');

// Test device subscription
socket.emit('subscribe:device', 'ESP32_01');

// Test notification sending (admin only)  
socket.emit('send:notification', {
  message: 'Test notification',
  type: 'info'
});
```

### MQTT + WebSocket Testing

```bash
# Send test MQTT message
mosquitto_pub -h localhost -t sensor/data -m '{
  "deviceId": "ESP32_01",
  "temperature": 25.5,
  "humidity": 60.2,
  "timestamp": "2024-11-13T10:00:00Z"
}'
```

### Multi-user Testing

1. Mở dashboard trong **2+ browser tabs**
2. Login với different users  
3. Test real-time data sharing
4. Test notification broadcasting
5. Verify connection indicators

---

## 🔒 Security Features

### Authentication
- **JWT-based authentication** cho WebSocket connections
- **User role permissions** (user, operator, admin)
- **Automatic disconnection** khi token expires
- **Token refresh** support

### Rate Limiting
- **Connection attempt limits**
- **Message rate limiting** 
- **Subscription limits** per user
- **Automatic cleanup** inactive connections

---

## 🚨 Error Handling

### Connection Errors
- **Auto-retry** với exponential backoff
- **Visual error indicators**
- **Fallback to API polling**
- **Graceful degradation**

### Authentication Errors
- **Redirect to login** when token invalid
- **Clear stored tokens**
- **Show appropriate messages**

---

## 📊 Performance Optimization

### Client-side
- **Connection pooling**
- **Event listener cleanup** 
- **Memory management** for notifications
- **Efficient re-renders** với React hooks

### Server-side  
- **Connection limits**
- **Message batching**
- **Room-based subscriptions**
- **Automatic cleanup** idle connections

---

## 🛠️ Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| WebSocket không connect | Check CORS settings, JWT token |
| Data không real-time | Verify MQTT connection, device subscriptions |
| Notifications không hiện | Check authentication, event listeners |
| Multiple connections | Clear browser storage, restart |
| Memory leaks | Check event listener cleanup |

### Debug Commands

```bash
# Check server WebSocket status
curl http://localhost:5000/api/sensors/mqtt-status

# Monitor server logs  
npm run dev # Backend server logs

# Check browser WebSocket
# Open DevTools > Network > WS tab
```

---

## 🌟 Next Steps (Future Enhancements)

1. **📱 Mobile App Integration** - React Native client
2. **🔧 Device Management** - Remote configuration
3. **📈 Advanced Analytics** - ML predictions
4. **🚨 Alert Rules** - Custom thresholds
5. **📊 Data Export** - CSV, JSON downloads
6. **🔄 Data Synchronization** - Offline support

---

## 📖 API Reference

### WebSocket Events

#### Client → Server
- `subscribe:device` - Subscribe to device data
- `unsubscribe:device` - Unsubscribe from device
- `subscribe:all` - Subscribe to all devices (admin)
- `request:latest` - Request latest data
- `request:status` - Request connection status
- `send:notification` - Send notification (admin)

#### Server → Client  
- `connected` - Connection established
- `sensor:data` - Real-time sensor data
- `notification` - System notification
- `system:alert` - System alert
- `status:update` - Connection statistics
- `user:joined` - User connected (admin)
- `user:left` - User disconnected (admin)

---

**🎉 STAGE 8 COMPLETE!** 

Real-time IoT Dashboard với WebSocket integration thành công! 
Dashboard hiện có khả năng streaming live data từ sensors với notifications và multi-user support.

**Ready for Production Deployment** 🚀
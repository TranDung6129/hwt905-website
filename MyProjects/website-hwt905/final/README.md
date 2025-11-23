# IoT Sensor Dashboard - Phiên bản Hoàn chỉnh

Website hoàn chỉnh cho hệ thống giám sát IoT Sensor với đầy đủ tính năng:
- ✅ React Frontend với real-time WebSocket
- ✅ Node.js Backend với Express và Socket.IO
- ✅ MongoDB Database
- ✅ JWT Authentication & Authorization
- ✅ MQTT Integration cho IoT devices
- ✅ Real-time data streaming

## Cấu trúc Dự án

```
final/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API & WebSocket services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React Context providers
│   │   └── ...
│   └── package.json
│
└── backend/          # Node.js Express server
    ├── config/       # Database configuration
    ├── controllers/  # Route controllers
    ├── middleware/   # Express middleware
    ├── models/       # MongoDB models
    ├── routes/       # API routes
    ├── services/     # Business logic services
    ├── utils/        # Utility functions
    └── server.js     # Main server file
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env với thông tin của bạn
# - MONGODB_URI: MongoDB connection string
# - JWT_SECRET: Secret key cho JWT tokens
# - MQTT_BROKER_URL: MQTT broker URL (optional)

# Start server
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env với API URL
# REACT_APP_API_URL=http://localhost:5000

# Start React app
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Cấu hình Môi trường

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sensor_dashboard
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# MQTT Configuration (optional)
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_TOPIC_SENSOR_DATA=sensor/data

# MQTT Authentication (Required if broker requires authentication)
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
MQTT_CLIENT_ID=sensor-dashboard-server
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000
```

## Tính năng

### Frontend
- Dashboard với real-time sensor data
- Biểu đồ dữ liệu (24h, 7d)
- Lịch sử dữ liệu với pagination
- Authentication (Login/Register)
- Protected routes với role-based access
- Real-time WebSocket connection
- Notification system
- Responsive design

### Backend
- REST API endpoints
- JWT Authentication
- User management với roles (user, operator, admin)
- MQTT service cho IoT data collection
- Socket.IO cho real-time communication
- MongoDB data storage
- Error handling & logging

## Authentication

### Đăng ký User mới
```bash
POST /api/auth/register
Body: {
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Đăng nhập
```bash
POST /api/auth/login
Body: {
  "usernameOrEmail": "user123",
  "password": "password123"
}
```

### Sử dụng Token
Tất cả protected routes yêu cầu header:
```
Authorization: Bearer <token>
```

## MQTT Integration

Backend tự động lắng nghe MQTT messages từ topic: `sensor/data`

Format message:
```json
{
  "deviceId": "ESP32_01",
  "temperature": 25.5,
  "humidity": 60.2,
  "pressure": 1013.2,
  "light": 845,
  "timestamp": "2024-11-13T10:00:00Z"
}
```

## WebSocket Real-time

Frontend tự động kết nối WebSocket khi user đăng nhập.

Events:
- `sensor:data` - Real-time sensor data updates
- `notification` - System notifications
- `system:alert` - System alerts
- `status:update` - Connection statistics

## API Endpoints

### Sensor Data
- `GET /api/sensors/latest` - Lấy dữ liệu mới nhất
- `GET /api/sensors/history` - Lấy lịch sử dữ liệu
- `GET /api/sensors/stats` - Thống kê dữ liệu
- `GET /api/sensors/devices` - Danh sách devices
- `POST /api/sensors/data` - Tạo dữ liệu mới (manual)

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy profile
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất

## Development

### Backend Scripts
```bash
npm start      # Start production server
npm run dev    # Start development server với nodemon
```

### Frontend Scripts
```bash
npm start      # Start development server
npm run build   # Build production
npm test        # Run tests
```

## Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ODM
- socket.io - WebSocket server
- mqtt - MQTT client
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- cors - CORS middleware
- helmet - Security headers
- dotenv - Environment variables

### Frontend
- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- socket.io-client - WebSocket client
- recharts - Charts library

## Deployment

### Backend
1. Set environment variables trên hosting platform
2. Deploy lên Render.com, Heroku, hoặc VPS
3. Đảm bảo MongoDB Atlas hoặc MongoDB instance đã được cấu hình

### Frontend
1. Build production: `npm run build`
2. Deploy `build/` folder lên Netlify, Vercel, hoặc static hosting
3. Set `REACT_APP_API_URL` environment variable

## Troubleshooting

### Lỗi: "Không thể kết nối server authentication"

**Nguyên nhân:** Backend server chưa được khởi động hoặc không thể kết nối.

**Giải pháp:**

1. **Kiểm tra Backend Server có đang chạy:**
   ```bash
   cd backend
   npm run dev
   ```
   
   Bạn sẽ thấy thông báo:
   ```
   SERVER ĐÃ KHỞI ĐỘNG THÀNH CÔNG!
   URL: http://localhost:5000
   ```

2. **Kiểm tra MongoDB có đang chạy:**
   ```bash
   # Trên Linux/Mac
   sudo systemctl status mongod
   # hoặc
   mongod --version
   ```

3. **Kiểm tra API URL trong Frontend:**
   - Đảm bảo file `.env` trong `frontend/` có:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
   - Restart frontend sau khi thay đổi `.env`

4. **Kiểm tra Port 5000 có bị chiếm:**
   ```bash
   # Linux/Mac
   lsof -i :5000
   # Windows
   netstat -ano | findstr :5000
   ```

5. **Kiểm tra CORS:**
   - Đảm bảo `CLIENT_URL` trong backend `.env` đúng với frontend URL
   - Mặc định: `CLIENT_URL=http://localhost:3000`

6. **Xem trạng thái hệ thống:**
   - Trên trang login, phần "Trạng thái hệ thống" sẽ hiển thị:
     - **Hoạt động** (xanh) - Server đang chạy
     - **Không hoạt động** (đỏ) - Server không kết nối được
     - **Đang kiểm tra...** (vàng) - Đang kiểm tra kết nối

### Lỗi: "MongoDB connection failed"

**Giải pháp:**
1. Đảm bảo MongoDB đã được cài đặt và chạy
2. Kiểm tra `MONGODB_URI` trong backend `.env` file
3. Mặc định: `mongodb://localhost:27017/sensor_dashboard`

### Lỗi: "Token không hợp lệ"

**Giải pháp:**
1. Đăng xuất và đăng nhập lại
2. Xóa localStorage trong browser (F12 > Application > Local Storage > Clear)
3. Kiểm tra `JWT_SECRET` trong backend `.env`

## Notes

- Đảm bảo MongoDB đã được cài đặt và chạy
- MQTT broker (mosquitto) là optional, chỉ cần nếu có IoT devices
- JWT_SECRET nên được thay đổi trong production
- CORS được cấu hình cho development, cần điều chỉnh cho production
- **Quan trọng:** Backend server phải chạy trước khi frontend có thể đăng nhập

## Documentation

Xem thêm chi tiết trong các thư mục:
- `Documentations/` - Tài liệu chi tiết cho từng giai đoạn
- `PROJECT_SUMMARY.md` - Tổng quan dự án

## Hoàn thành!

Website đã sẵn sàng để sử dụng với đầy đủ tính năng từ authentication đến real-time data streaming!


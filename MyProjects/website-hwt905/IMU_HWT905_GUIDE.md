# Hướng dẫn sử dụng HWT905 format mới cho giám sát công trình xây dựng (SHM)

## Tổng quan

Hệ thống đã được cập nhật để hỗ trợ dữ liệu từ cảm biến IMU hwt905, chuyên dụng cho giám sát sức khỏe cấu trúc (Structural Health Monitoring - SHM) của các công trình xây dựng.

## Thông số giám sát

### 1. Gia tốc tổng hợp (Total Acceleration)
- **Đơn vị**: m/s²
- **Tính toán từ**: √(acc_x_filtered² + acc_y_filtered² + acc_z_filtered²)
- **Ngưỡng an toàn**:
  - Ổn định: < 5 m/s²
  - Trung bình: 5-15 m/s²
  - Cao: > 15 m/s²

### 2. Góc nghiêng (Tilt Angle)
- **Đơn vị**: độ (°)
- **Tính toán từ**: atan2(√(disp_x² + disp_y²), |disp_z|) * 180/π
- **Ngưỡng an toàn**:
  - Bình thường: < 10°
  - Cảnh báo: 10-30°
  - Nguy hiểm: > 30°

### 3. Cường độ rung (Vibration Intensity)
- **Đơn vị**: mm/s
- **Tính toán từ**: velocity_magnitude_mm_s (trực tiếp)
- **Ngưỡng an toàn**:
  - Thấp: < 40 mm/s
  - Trung bình: 40-80 mm/s
  - Cao: > 80 mm/s

### 4. Chuyển vị cấu trúc (Structural Displacement)
- **Đơn vị**: mm
- **Tính toán từ**: displacement_magnitude * 1000 (chuyển m sang mm)
- **Ngưỡng an toàn**:
  - An toàn: < 20 mm
  - Cảnh báo: 20-40 mm
  - Nguy hiểm: > 40 mm

### 5. Tần số đặc trưng (Dominant Frequency)
- **Đơn vị**: Hz
- **Tính toán từ**: overall_dominant_frequency (trực tiếp)
- **Ngưỡng an toàn**:
  - Bình thường: < 5 Hz
  - Trung bình: 5-20 Hz
  - Cao: > 20 Hz

## Cấu trúc dữ liệu MQTT

### Dữ liệu đầu vào (từ HWT905 format mới):
```json
{
  "metadata": {
    "source": "HWT905_RasPi",
    "strategy": "continuous",
    "sample_count": 1,
    "start_time": 1763549422.7109373,
    "end_time": 1763549422.7109373,
    "location": "Cầu ABC - Trụ 1"
  },
  "data_points": [{
    "ts": 1763549422.7109373,
    "vel_x": 8.60925631305608e-06,
    "vel_y": -0.00011813733941432259,
    "vel_z": 0.00017071901437263232,
    "velocity_magnitude": 0.00020778722801587636,
    "velocity_magnitude_mm_s": 0.20778722801587635,
    "disp_x": 8.759567613172303e-09,
    "disp_y": -5.0319498284103925e-08,
    "disp_z": 4.0582227165395136e-08,
    "displacement_magnitude": 6.523571946439626e-08,
    "dominant_freq_x": 1.7578125,
    "dominant_freq_y": 0.1953125,
    "dominant_freq_z": 0.09765625,
    "overall_dominant_frequency": 1.7578125,
    "acc_x_filtered": 3.123954200927332e-05,
    "acc_y_filtered": -0.0004967754202176261,
    "acc_z_filtered": 0.0008311885890108318,
    "acc_x": 0.0,
    "acc_y": 0.0,
    "acc_z": 1.0,
    "rls_warmed_up": true
  }]
}
```

### Topics MQTT:
- `sensor/HWT905_RasPi/data` - Dữ liệu chính
- `sensor/HWT905_RasPi/status` - Trạng thái thiết bị
- `sensor/HWT905_RasPi/error` - Báo lỗi

## Giao diện người dùng

### Dashboard mới hiển thị:
1. **5 thẻ thông số SHM** bao gồm tần số đặc trưng
2. **Trạng thái an toàn** với mã màu:
   - 🟢 Xanh lá: An toàn/Ổn định
   - 🟡 Vàng: Cảnh báo/Trung bình
   - 🔴 Đỏ: Nguy hiểm/Cao
3. **Xu hướng** biến đổi: Tăng/Giảm/Ổn định
4. **Biểu đồ** chỉ hiển thị dữ liệu chuyển vị
5. **Bảng lịch sử** có mã màu theo mức độ nguy hiểm

### Cảnh báo real-time:
- Hệ thống tự động gửi cảnh báo khi vượt ngưỡng
- WebSocket broadcast đến tất cả client đang kết nối
- Phân loại: Warning / Critical

## Cài đặt và sử dụng

### 1. Backend Setup
```bash
cd final/backend
npm install
# Cấu hình MQTT_BROKER_URL trong .env
npm start
```

### 2. Frontend Setup  
```bash
cd final/frontend
npm install
npm start
```

### 3. Test với dữ liệu mẫu
```bash
# Trong backend directory
node -e "require('./services/mqttService').publishTestMessage()"
```

## Tích hợp thực tế

### Kết nối HWT905:
1. Cấu hình HWT905 để publish dữ liệu qua MQTT theo format mới
2. Đảm bảo format JSON đúng như mẫu trên với metadata và data_points
3. Thiết lập topic: `sensor/{source}/data`

### Monitoring:
- Dashboard cập nhật real-time qua WebSocket
- Lưu trữ tự động vào MongoDB
- API endpoints để truy xuất dữ liệu lịch sử

## Mở rộng

Hệ thống có thể mở rộng để hỗ trợ:
- Nhiều thiết bị IMU đồng thời
- Báo cáo định kỳ
- Machine Learning để dự đoán xu hướng
- Tích hợp với hệ thống cảnh báo SMS/Email

## Liên hệ hỗ trợ

Khi có vấn đề, kiểm tra:
1. Kết nối MQTT broker
2. Format dữ liệu JSON
3. WebSocket connection status
4. Console logs của backend và frontend

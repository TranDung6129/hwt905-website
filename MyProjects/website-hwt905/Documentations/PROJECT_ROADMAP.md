# QUY TRÌNH 8 GIAI ĐOẠN - SENSOR DASHBOARD

## Tổng quan dự án
Xây dựng hệ thống Dashboard giám sát IoT với dữ liệu thật từ Raspberry Pi qua MQTT.

---

## ✅ GIAI ĐOẠN 1: DỰNG KHUNG GIAO DIỆN TĨNH
**Trạng thái: HOÀN THÀNH**

### Mục tiêu
Tạo giao diện hoàn chỉnh với HTML/CSS thuần túy, dữ liệu hard-code.

### Kết quả
- `stage1-static/dashboard.html` - Dashboard với semantic HTML
- `stage1-static/login.html` - Form đăng nhập/đăng ký
- `stage1-static/style.css` - Responsive CSS với Grid/Flexbox  
- `stage1-static/login-style.css` - Styling cho login forms

### Kiến thức áp dụng
- **Chương 2**: Semantic HTML5 tags
- **Chương 3**: CSS Grid, Flexbox, Responsive Design

---

## 🔄 GIAI ĐOẠN 2: THÊM TƯƠNG TÁC JAVASCRIPT
**Trạng thái: ĐANG CHUẨN BỊ**

### Mục tiêu
Làm giao diện "sống động" với JavaScript cơ bản.

### Kế hoạch
- Toggle sidebar trên mobile
- Form validation cho login/register
- Tab switching (24h/7d/30d charts)
- Interactive elements

### Kiến thức cần áp dụng
- **Chương 4**: JavaScript cơ bản, DOM manipulation
- **Chương 5**: Events, Form validation

---

## ⏳ GIAI ĐOẠN 3: REACT SPA
**Trạng thái: CHƯA BẮT ĐẦU**

### Mục tiêu
Chuyển đổi sang Single Page Application với React.

### Kế hoạch
- Khởi tạo `create-react-app`
- Chia thành components: Sidebar, Navbar, DataCard, etc.
- React Router cho /login và /dashboard
- State management với useState
- Tích hợp thư viện chart (Chart.js hoặc Recharts)

### Kiến thức cần áp dụng
- **Chương 6**: React Components, State, Props, Router

---

## ⏳ GIAI ĐOẠN 4: BACKEND CORE (MQTT LISTENER)
**Trạng thái: CHƯA BẮT ĐẦU**

### Mục tiêu
Xây dựng server Node.js lắng nghe MQTT từ Raspberry Pi.

### Kế hoạch
- Setup Express.js server
- Kết nối MongoDB (Atlas)
- MQTT client subscribe vào topic từ RasPi
- Lưu dữ liệu sensor vào database
- Schema: SensorData model

### Kiến thức cần áp dụng  
- **Chương 8**: Node.js, Express.js, MongoDB, Mongoose

---

## ⏳ GIAI ĐOẠN 5: API LỊCH SỬ & FULL-STACK
**Trạng thái: CHƯA BẮT ĐẦU**

### Mục tiêu
Tạo RESTful API để React lấy dữ liệu từ database.

### Kế hoạch
- `GET /api/data/latest` - Dữ liệu mới nhất
- `GET /api/data/history` - Lịch sử với pagination
- React integration với Axios
- useEffect + async/await để fetch data
- Hiển thị dữ liệu thật trên dashboard

### Kiến thức cần áp dụng
- **Chương 7**: RESTful API, JSON, Axios
- **Chương 5**: Async/Await

---

## ⏳ GIAI ĐOẠN 6: BẢO MẬT ỨNG DỤNG
**Trạng thái: CHƯA BẮT ĐẦU**

### Mục tiêu
Thêm authentication và authorization.

### Kế hoạch
- JWT authentication
- `POST /api/auth/login`, `/register`
- Middleware bảo vệ API endpoints
- React Context API cho auth state
- Protected Routes
- CORS configuration

### Kiến thức cần áp dụng
- **Chương 9**: JWT, Security, CORS
- **Chương 6**: React Context API

---

## ⏳ GIAI ĐOẠN 7: TRIỂN KHAI (DEPLOYMENT)
**Trạng thái: CHƯA BẮT ĐẦU**

### Mục tiêu
Đưa ứng dụng lên production.

### Kế hoạch
- Frontend: Deploy lên Vercel/Netlify
- Backend: Deploy lên Render.com/Heroku
- Database: MongoDB Atlas (cloud)
- Environment variables setup
- CI/CD với GitHub Actions

### Kiến thức cần áp dụng
- **Chương 10**: Deployment, Docker, CI/CD

---

## ⏳ GIAI ĐOẠN 8: REAL-TIME WEBSOCKET
**Trạng thái: CHƯA BẮT ĐẦU**

### Mục tiêu
Dashboard tự động cập nhật khi có dữ liệu mới từ RasPi.

### Kế hoạch
- Socket.IO server integration
- MQTT → MongoDB → WebSocket pipeline  
- React Socket.IO client
- Real-time chart updates
- Push notifications

### Kiến thức cần áp dụng
- **Nâng cao**: WebSocket, Socket.IO
- **Chương 6**: React useEffect cleanup

---

## 📊 TIẾN ĐỘƯƠNG HIỆN TẠI

```
Giai đoạn 1: ████████████ 100% ✅
Giai đoạn 2: ░░░░░░░░░░░░   0% 🔄  
Giai đoạn 3: ░░░░░░░░░░░░   0%
Giai đoạn 4: ░░░░░░░░░░░░   0%
Giai đoạn 5: ░░░░░░░░░░░░   0%
Giai đoạn 6: ░░░░░░░░░░░░   0%
Giai đoạn 7: ░░░░░░░░░░░░   0%
Giai đoạn 8: ░░░░░░░░░░░░   0%
```

## 🎯 MỤC TIÊU CUỐI CÙNG

Sau 8 giai đoạn, bạn sẽ có:

1. **Dashboard hoàn chỉnh** với giao diện chuyên nghiệp
2. **Dữ liệu thật** từ Raspberry Pi qua MQTT  
3. **Real-time updates** không cần refresh trang
4. **Authentication system** bảo mật
5. **Production deployment** trên cloud
6. **Responsive design** tương thích mọi thiết bị

## 📋 CÁCH SỬ DỤNG ROADMAP

1. **Hoàn thành tuần tự** từ Giai đoạn 1 → 8
2. **Không bỏ qua** giai đoạn nào
3. **Test kỹ** trước khi chuyển giai đoạn tiếp theo  
4. **Commit code** sau mỗi giai đoạn hoàn thành

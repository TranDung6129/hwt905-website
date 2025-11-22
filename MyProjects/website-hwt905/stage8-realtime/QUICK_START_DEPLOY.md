# ⚡ QUICK DEPLOY - STAGE 7 PRODUCTION

## 🚀 Deploy IoT Dashboard trong 15 phút

### **Bước 1: Deploy Backend (5 phút) - Render.com**

```bash
# 1. Tạo tài khoản Render.com với GitHub
# 2. New Web Service → Connect repository
# 3. Cấu hình:
#    Name: iot-sensor-dashboard-backend
#    Root Directory: stage4-backend
#    Build Command: npm ci
#    Start Command: npm start

# 4. Environment Variables:
NODE_ENV=production
JWT_SECRET=your-super-secret-32-characters-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sensor-dashboard
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=5000

# 5. Deploy → Copy URL: https://your-backend.onrender.com
```

### **Bước 2: Deploy Frontend (5 phút) - Vercel**

```bash
# 1. Tạo tài khoản Vercel với GitHub
# 2. New Project → Import repository
# 3. Cấu hình:
#    Framework: Create React App
#    Root Directory: stage7-deploy
#    Build Command: npm run build
#    Output Directory: build

# 4. Environment Variables:
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_NAME=IoT Sensor Dashboard
REACT_APP_ENV=production

# 5. Deploy → Copy URL: https://your-frontend.vercel.app
```

### **Bước 3: Setup Database (5 phút) - MongoDB Atlas**

```bash
# 1. Tạo tài khoản MongoDB Atlas
# 2. Create Cluster: M0 Sandbox (FREE)
# 3. Database Access: Create user với password
# 4. Network Access: Add IP 0.0.0.0/0 (allow all)
# 5. Get connection string → Update backend MONGODB_URI
# 6. Update backend CORS_ORIGIN với frontend URL
```

## ✅ Verification (2 phút)

```bash
# Test backend
curl https://your-backend.onrender.com/health
# Expected: {"status":"UP","database":"connected"}

# Test frontend  
# Open: https://your-frontend.vercel.app
# Click: "Demo Login (admin/admin123)"
# Expected: Successful login → dashboard

# Test end-to-end
# Dashboard should display sensor data và be fully functional
```

## 🎯 Success!

**Your IoT Dashboard is now live:**
- **Frontend**: https://your-frontend.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Login**: admin / admin123

## 🔧 Common Issues

```bash
# Backend won't start:
# → Check environment variables spelling
# → Verify MongoDB connection string

# CORS errors:
# → Update backend CORS_ORIGIN với exact frontend URL
# → Restart backend service

# Login not working:
# → Verify JWT_SECRET is set
# → Check browser network tab for API errors
```

## 📚 Full Documentation

- **README.md** - Complete deployment overview
- **DEPLOYMENT_GUIDE.md** - Detailed step-by-step guide  
- **TESTING_GUIDE.md** - Comprehensive testing procedures

**🌐 Your IoT Dashboard is production-ready! 🚀**

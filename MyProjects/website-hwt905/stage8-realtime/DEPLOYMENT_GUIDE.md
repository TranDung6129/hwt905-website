# 🚀 DEPLOYMENT GUIDE - STAGE 7 PRODUCTION

## ⚡ Quick Deploy (15 minutes)

### **Option A: Vercel + Render (Recommended)**

#### **1. Deploy Backend to Render.com (5 min)**

```bash
# Step 1: Create Render account và connect GitHub
1. Go to render.com → Sign up với GitHub
2. Click "New +" → "Web Service"
3. Connect your repository
4. Settings:
   - Name: iot-sensor-dashboard-backend
   - Root Directory: stage4-backend
   - Build Command: npm ci
   - Start Command: npm start
```

```bash
# Step 2: Configure Environment Variables
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-2024
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sensor-dashboard
CORS_ORIGIN=https://your-frontend-will-be-here.vercel.app
PORT=5000
```

```bash
# Step 3: Deploy và get URL
# Backend will be live at: https://your-app-name.onrender.com
# Test: curl https://your-app-name.onrender.com/health
```

#### **2. Deploy Frontend to Vercel (5 min)**

```bash
# Step 1: Create Vercel account và connect GitHub
1. Go to vercel.com → Sign up với GitHub  
2. Click "New Project" → Import your repository
3. Settings:
   - Framework Preset: Create React App
   - Root Directory: stage7-deploy
   - Build Command: npm run build
   - Output Directory: build
```

```bash
# Step 2: Configure Environment Variables
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_NAME=IoT Sensor Dashboard
REACT_APP_ENV=production
```

```bash
# Step 3: Deploy và get URL
# Frontend will be live at: https://your-app-name.vercel.app
# Update backend CORS_ORIGIN với this URL
```

#### **3. Setup Database (5 min)**

```bash
# MongoDB Atlas (Free Tier)
1. Go to mongodb.com/atlas → Create account
2. Create cluster: M0 Sandbox (FREE)
3. Database Access: Create user với password
4. Network Access: Allow access from anywhere (0.0.0.0/0)
5. Get connection string → Update backend MONGODB_URI
```

### **🎯 Verification**

```bash
# 1. Test backend health
curl https://your-backend.onrender.com/health
# Expected: {"status":"UP","database":"connected"}

# 2. Test frontend
Open: https://your-frontend.vercel.app
Click: "Demo Login" → Should work end-to-end

# 3. Test authentication  
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin","password":"admin123"}'
# Expected: JWT token response
```

---

## 🐳 Option B: Docker Deployment

### **Full Stack với Docker Compose**

```bash
# 1. Clone và setup
git clone your-repo
cd website-hwt905/stage7-deploy

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local với your settings

# 3. Deploy full stack
docker-compose up -d --build

# 4. Services available:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000  
# MongoDB: localhost:27017
# MQTT: localhost:1883
```

### **Individual Container Deployment**

```bash
# Build frontend
cd stage7-deploy
docker build -t iot-frontend .
docker run -d -p 3000:80 -e BACKEND_URL=https://your-backend.com iot-frontend

# Build backend  
cd ../stage4-backend
docker build -t iot-backend .
docker run -d -p 5000:5000 \
  -e MONGODB_URI=your-mongo-connection \
  -e JWT_SECRET=your-secret \
  iot-backend
```

---

## 🔄 CI/CD Setup (GitHub Actions)

### **Automatic Deployment on Git Push**

```bash
# 1. Configure GitHub Secrets
Repository Settings → Secrets and Variables → Actions

# Vercel secrets:
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Render secrets:
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-service-id

# Environment:
REACT_APP_API_URL=https://your-backend.onrender.com
```

```bash  
# 2. Push to main branch
git add .
git commit -m "Deploy to production"
git push origin main

# 3. Watch GitHub Actions
# - Frontend builds và deploys to Vercel
# - Backend builds và deploys to Render
# - Automatic health checks
```

---

## 🛠️ Manual Production Build

### **Frontend Static Build**

```bash
cd stage7-deploy

# Install dependencies
npm ci

# Set production environment
export REACT_APP_API_URL=https://your-backend.onrender.com
export REACT_APP_NAME="IoT Sensor Dashboard"
export REACT_APP_ENV=production
export GENERATE_SOURCEMAP=false

# Build for production
npm run build

# Result: build/ directory ready for static hosting
# Upload to: AWS S3, Google Storage, GitHub Pages, etc.
```

### **Backend Production Setup**

```bash
cd stage4-backend

# Install production dependencies
npm ci --production

# Set environment variables
export NODE_ENV=production
export JWT_SECRET=your-secure-secret
export MONGODB_URI=your-mongo-connection
export PORT=5000

# Start production server
npm start

# Or using PM2 for process management:
npm install -g pm2
pm2 start server.js --name "iot-backend"
```

---

## 🌐 Custom Domain Setup

### **Vercel Custom Domain**

```bash
# 1. Vercel Dashboard → Your Project → Settings → Domains
# 2. Add your domain: yourdomain.com
# 3. Configure DNS:
#    Type: CNAME
#    Name: @ (or www)  
#    Value: cname.vercel-dns.com
# 4. SSL automatically configured
```

### **Render Custom Domain**

```bash
# 1. Render Dashboard → Your Service → Settings → Custom Domains
# 2. Add your domain: api.yourdomain.com
# 3. Configure DNS:
#    Type: CNAME
#    Name: api
#    Value: your-service.onrender.com
# 4. SSL automatically configured
```

---

## 📊 Production Monitoring

### **Health Check Endpoints**

```bash
# Backend health check
GET https://your-backend.onrender.com/health
Response: {
  "status": "UP",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "mqtt": "connected"
}

# Frontend health (basic availability)
GET https://your-frontend.vercel.app/
Response: 200 OK với React app loaded
```

### **Performance Monitoring**

```bash
# Vercel Analytics (built-in)
# - Real User Monitoring
# - Core Web Vitals
# - Geographic performance

# Render Metrics (built-in)  
# - Response times
# - CPU/Memory usage
# - Error rates
# - Uptime monitoring
```

### **Error Tracking**

```bash
# Backend errors: Check Render logs
# Frontend errors: Browser console + Vercel function logs
# Database errors: MongoDB Atlas monitoring

# Optional: Integrate Sentry for comprehensive error tracking
npm install @sentry/react @sentry/node
```

---

## 🔒 Security Checklist

### **Production Security Requirements**

```bash
# ✅ HTTPS enforced on all services
# ✅ Environment variables secure (not in code)
# ✅ JWT secrets strong và unique
# ✅ Database authentication enabled
# ✅ CORS configured properly
# ✅ Security headers implemented
# ✅ No console.log in production
# ✅ Source maps disabled
# ✅ Dependencies updated (npm audit)
# ✅ Rate limiting enabled
# ✅ Input validation comprehensive
```

### **Security Testing**

```bash
# SSL/TLS verification
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Security headers check
curl -I https://your-frontend.vercel.app | grep -E "(X-Frame|X-Content|X-XSS)"

# Vulnerability scan
npm audit --audit-level moderate
# Fix any high/critical vulnerabilities
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Build Failures**
```bash
# Frontend build fails
- Check all REACT_APP_* environment variables are set
- Verify API URL is accessible
- Check for TypeScript/ESLint errors
- Increase build timeout if needed

# Backend deployment fails  
- Verify all required environment variables
- Check MongoDB connection string
- Ensure PORT is set correctly
- Review Docker build logs
```

#### **Runtime Errors**
```bash
# CORS errors (browser console)
- Update backend CORS_ORIGIN với frontend URL
- Restart backend after CORS changes
- Check for trailing slashes in URLs

# Authentication not working
- Verify JWT_SECRET matches between environments
- Check token expiry settings
- Confirm API URLs match exactly
```

#### **Performance Issues**
```bash
# Slow loading
- Check CDN cache settings
- Optimize images và assets
- Review bundle size (npm run build -- --analyze)
- Monitor database query performance

# High server load
- Check for inefficient database queries
- Monitor MongoDB Atlas performance advisor
- Consider implementing Redis caching
- Review rate limiting settings
```

### **Emergency Procedures**

#### **Rollback Deployment**
```bash
# Vercel: Dashboard → Deployments → Promote previous
# Render: Dashboard → Manual Deploy → Select previous commit
# Database: Use MongoDB Atlas point-in-time recovery if needed
```

#### **Scale for Traffic**
```bash
# Vercel: Auto-scales (unlimited on Pro plan)
# Render: Upgrade instance size or enable auto-scaling
# Database: MongoDB Atlas auto-scaling enabled by default
```

---

## 📈 Optimization Tips

### **Performance Optimization**

```bash
# Frontend:
- Enable service worker: REACT_APP_ENABLE_SERVICE_WORKER=true
- Implement code splitting for large components
- Optimize images: WebP format với fallbacks
- Use React.memo for expensive components

# Backend:
- Implement Redis caching for frequent queries
- Add database indexes for search queries  
- Use connection pooling for MongoDB
- Enable compression middleware
```

### **Cost Optimization**

```bash
# Vercel: 
- Hobby plan FREE for personal projects
- Pro plan $20/month for commercial use

# Render:
- Starter plan $7/month for small apps
- Standard plan $25/month for production

# MongoDB Atlas:
- M0 FREE (512MB storage, shared)
- M2 $9/month (2GB storage, dedicated)

# Total cost for small production: ~$16-54/month
```

---

## 🎯 Go Live Checklist

### **Pre-Launch Final Steps**

```bash
# ✅ All services deployed và accessible
# ✅ Database populated với initial data
# ✅ Authentication tested end-to-end
# ✅ HTTPS certificates active
# ✅ Custom domains configured (if applicable)
# ✅ Monitoring và alerting setup
# ✅ Backup strategy implemented
# ✅ Performance tested under load
# ✅ Security scan completed
# ✅ Documentation updated với production URLs
```

### **Launch Day Tasks**

```bash
# 1. Final smoke test of all features
# 2. Monitor server metrics closely
# 3. Watch error logs for issues
# 4. Test from different geographic locations
# 5. Verify mobile responsiveness
# 6. Confirm email notifications work (if implemented)
# 7. Update team với production URLs
# 8. Celebrate successful deployment! 🎉
```

---

## 📞 Support & Maintenance

### **Ongoing Maintenance**

```bash
# Weekly:
- Review error logs
- Check performance metrics
- Monitor uptime và availability

# Monthly:  
- Update dependencies (npm update)
- Review security audit (npm audit)
- Analyze usage metrics
- Backup database (MongoDB Atlas automated)

# Quarterly:
- Performance optimization review
- Security assessment
- Capacity planning
- Cost optimization review
```

### **Getting Help**

```bash
# Platform Support:
- Vercel: help.vercel.com + Discord community
- Render: help.render.com + support tickets  
- MongoDB Atlas: docs.atlas.mongodb.com + community forums

# Code Issues:
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- React/Node.js documentation
```

**🚀 Your IoT Dashboard is now production-ready và live!**

**Production URLs to share:**
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Admin Login**: admin / admin123

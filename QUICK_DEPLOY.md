# 🚀 Quick Deployment Guide - Vivento Campus Events

Repository: https://github.com/deepakkode/N8N_Hackthon.git

## ⚡ 5-Minute Deployment

### 🔧 Step 1: Deploy Backend (Render.com)

1. **Go to Render.com**
   - Visit: https://render.com
   - Sign up/Login with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub → Select `deepakkode/N8N_Hackthon`
   - Configure:
     ```
     Name: vivento-backend
     Environment: Node
     Root Directory: backend
     Build Command: npm install
     Start Command: npm start
     ```

3. **Add Environment Variables**
   ```env
   PORT=10000
   MONGODB_URI=mongodb+srv://balayyaj05_db_user:CvzMIAlHI40cGLFQ@cluster0.03sgflx.mongodb.net/college-events?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=college-events-super-secret-jwt-key-2026
   NODE_ENV=production
   EMAIL_USER=kodedeepak40@gmail.com
   EMAIL_PASS=lxbifwgdvuumbdtv
   EMAIL_FROM=Vivento Events <kodedeepak40@gmail.com>
   COLLEGE_DOMAIN=klu.ac.in
   COLLEGE_NAME=KL University
   FRONTEND_URL=https://vivento-campus-events.netlify.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Note your backend URL: `https://vivento-backend-xxxx.onrender.com`

### 🌐 Step 2: Deploy Frontend (Netlify)

1. **Go to Netlify**
   - Visit: https://netlify.com
   - Sign up/Login with GitHub

2. **Create Site**
   - Click "New site from Git"
   - Connect GitHub → Select `deepakkode/N8N_Hackthon`
   - Configure:
     ```
     Build command: npm run build
     Publish directory: build
     ```

3. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add:
     ```env
     REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
     REACT_APP_ENV=production
     ```

4. **Deploy**
   - Click "Deploy site"
   - Wait 3-5 minutes for build
   - Your site will be live at: `https://amazing-name-123456.netlify.app`

### 🔄 Step 3: Update URLs

1. **Update Backend CORS**
   - Go to Render dashboard → Your service → Environment
   - Update `FRONTEND_URL` with your actual Netlify URL

2. **Update Frontend API**
   - Go to Netlify dashboard → Site settings → Environment variables
   - Update `REACT_APP_API_URL` with your actual Render URL

### ✅ Step 4: Test

1. **Visit your Netlify URL**
2. **Register a new account**
3. **Verify email works**
4. **Create a club and event**

## 🎉 You're Live!

Your Vivento Campus Events Platform is now deployed and accessible worldwide!

### 📱 Share Your App
- **Frontend**: Your Netlify URL
- **Features**: Full-featured campus events platform
- **Users**: Students and event organizers

### 🔧 Troubleshooting
- **CORS errors**: Check FRONTEND_URL in Render
- **API errors**: Check REACT_APP_API_URL in Netlify
- **Email issues**: Verify Gmail credentials in Render

### 📊 Monitor
- **Render**: Backend logs and performance
- **Netlify**: Frontend analytics and builds
- **MongoDB Atlas**: Database usage

---

**Total Time**: ~15 minutes
**Cost**: $0 (Free tiers)
**Result**: Professional campus events platform live on the internet! 🚀
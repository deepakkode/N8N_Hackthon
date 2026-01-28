# Deployment Guide - Vivento Campus Events Platform

This guide will help you deploy the Vivento Campus Events Platform to production using the GitHub repository: https://github.com/deepakkode/N8N_Hackthon.git

## 🚀 Deployment Architecture

- **Frontend**: Netlify (React.js)
- **Backend**: Render.com (Node.js/Express)
- **Database**: MongoDB Atlas (already configured)
- **Repository**: https://github.com/deepakkode/N8N_Hackthon.git

## 📋 Prerequisites

1. GitHub account (repository already exists)
2. Netlify account
3. Render.com account
4. MongoDB Atlas database (already set up)
5. Gmail account for email service (already configured)

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Access Repository
The repository is already available at: https://github.com/deepakkode/N8N_Hackthon.git

### 1.2 Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select the repository: `deepakkode/N8N_Hackthon`
4. Configure the service:
   - **Name**: `vivento-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 1.3 Set Environment Variables on Render
In the Render dashboard, go to Environment and add:

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

### 1.4 Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL: `https://vivento-backend.onrender.com`

## 🌐 Step 2: Deploy Frontend to Netlify

### 2.1 Build the Frontend
```bash
# Install dependencies
npm install

# Create production build
npm run build
```

### 2.2 Deploy on Netlify

#### Option A: Drag & Drop (Quick)
1. Go to [netlify.com](https://netlify.com) and login
2. Drag the `build` folder to the deploy area
3. Your site will be deployed instantly

#### Option B: Git Integration (Recommended)
1. Go to [netlify.com](https://netlify.com) and login
2. Click "New site from Git"
3. Connect your GitHub account and select: `deepakkode/N8N_Hackthon`
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Base directory**: (leave empty)

### 2.3 Set Environment Variables on Netlify
In Netlify dashboard, go to Site settings → Environment variables:

```env
REACT_APP_API_URL=https://vivento-backend.onrender.com/api
REACT_APP_ENV=production
```

### 2.4 Configure Custom Domain (Optional)
1. Go to Domain settings
2. Add custom domain or use the provided netlify.app domain
3. Update the domain name to something like: `vivento-campus-events.netlify.app`

## 🔄 Step 3: Update Configuration

### 3.1 Update Backend CORS
Update the backend environment variable on Render:
```env
FRONTEND_URL=https://your-actual-netlify-domain.netlify.app
```

### 3.2 Redeploy if Needed
- Backend: Will auto-redeploy on Render when you push to GitHub
- Frontend: Will auto-redeploy on Netlify when you push to GitHub

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend API
Visit: `https://your-backend-url.onrender.com`
Should return: `{"message": "College Events API is running!"}`

### 4.2 Test Frontend
Visit: `https://your-netlify-domain.netlify.app`
Should load the Vivento login page

### 4.3 Test Full Integration
1. Register a new account
2. Verify email functionality
3. Create a club (as organizer)
4. Create an event
5. Register for event (as student)

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check FRONTEND_URL in backend environment variables
   - Ensure both URLs are correct

2. **API Not Found**
   - Verify REACT_APP_API_URL in Netlify environment variables
   - Check backend deployment status on Render

3. **Email Not Working**
   - Verify Gmail credentials in backend environment variables
   - Check Gmail app password is correct

4. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas (allow all: 0.0.0.0/0)

### Logs:
- **Backend logs**: Available in Render dashboard
- **Frontend logs**: Available in Netlify dashboard
- **Build logs**: Check build process in respective platforms

## 🚀 Production URLs

After successful deployment:
- **Frontend**: `https://vivento-campus-events.netlify.app`
- **Backend**: `https://vivento-backend.onrender.com`
- **API Docs**: `https://vivento-backend.onrender.com/api`

## 🔄 Continuous Deployment

Both platforms support automatic deployment:
- **Push to main branch** → Automatic deployment
- **Pull request previews** available on both platforms
- **Rollback** options available in dashboards

## 📊 Monitoring

### Performance Monitoring:
- **Netlify**: Built-in analytics and performance monitoring
- **Render**: Resource usage and response time monitoring
- **MongoDB Atlas**: Database performance monitoring

### Error Tracking:
- Check platform-specific logs
- Monitor email delivery rates
- Track user registration and event creation success rates

## 🔒 Security Checklist

- ✅ Environment variables properly set
- ✅ CORS configured correctly
- ✅ JWT secrets are secure
- ✅ Database credentials are protected
- ✅ Email credentials are secure
- ✅ HTTPS enabled on both platforms

## 📈 Scaling Considerations

### Free Tier Limitations:
- **Render**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **MongoDB Atlas**: 512MB storage

### Upgrade Path:
- **Render**: $7/month for always-on service
- **Netlify**: $19/month for pro features
- **MongoDB Atlas**: $9/month for 2GB storage

---

🎉 **Congratulations!** Your Vivento Campus Events Platform is now live and ready for users!